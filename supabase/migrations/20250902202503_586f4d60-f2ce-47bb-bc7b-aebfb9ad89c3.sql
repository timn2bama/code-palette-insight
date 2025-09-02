
-- 1) Public sharing for outfits
ALTER TABLE public.outfits
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

-- Allow anyone to view public outfits while keeping existing owner-only access
CREATE POLICY "Public can view public outfits"
  ON public.outfits
  FOR SELECT
  USING (is_public = true);

-- 2) Likes
CREATE TABLE IF NOT EXISTS public.outfit_likes (
  outfit_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (outfit_id, user_id)
);

ALTER TABLE public.outfit_likes ENABLE ROW LEVEL SECURITY;

-- View likes for public outfits or own outfits; likers can always see their own like
CREATE POLICY "View likes for public or own outfits"
  ON public.outfit_likes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.outfits o
      WHERE o.id = outfit_id
        AND (o.is_public = true OR o.user_id = auth.uid())
    )
    OR user_id = auth.uid()
  );

-- Authenticated users can like public outfits (or their own private ones)
CREATE POLICY "Like public or own outfits"
  ON public.outfit_likes
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.outfits o
      WHERE o.id = outfit_id
        AND (o.is_public = true OR o.user_id = auth.uid())
    )
  );

-- Users can remove their own like
CREATE POLICY "Unlike your own like"
  ON public.outfit_likes
  FOR DELETE
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_outfit_likes_outfit ON public.outfit_likes (outfit_id);
CREATE INDEX IF NOT EXISTS idx_outfit_likes_user ON public.outfit_likes (user_id);

-- 3) Comments
CREATE TABLE IF NOT EXISTS public.outfit_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outfit_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.outfit_comments ENABLE ROW LEVEL SECURITY;

-- View comments on public outfits or on your own outfits; authors always see theirs
CREATE POLICY "View comments for public or own outfits"
  ON public.outfit_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.outfits o
      WHERE o.id = outfit_id
        AND (o.is_public = true OR o.user_id = auth.uid())
    )
    OR user_id = auth.uid()
  );

-- Authenticated users can comment on public outfits or on their own private outfits
CREATE POLICY "Comment on public or own outfits"
  ON public.outfit_comments
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.outfits o
      WHERE o.id = outfit_id
        AND (o.is_public = true OR o.user_id = auth.uid())
    )
  );

-- Authors can edit their comments
CREATE POLICY "Edit your own comment"
  ON public.outfit_comments
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Authors or outfit owners can delete a comment
CREATE POLICY "Delete comment (author or outfit owner)"
  ON public.outfit_comments
  FOR DELETE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1
      FROM public.outfits o
      WHERE o.id = outfit_id AND o.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_outfit_comments_outfit ON public.outfit_comments (outfit_id);
CREATE INDEX IF NOT EXISTS idx_outfit_comments_user ON public.outfit_comments (user_id);

-- 4) Ratings (1-5)
CREATE TABLE IF NOT EXISTS public.outfit_ratings (
  outfit_id uuid NOT NULL,
  user_id uuid NOT NULL,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (outfit_id, user_id)
);

ALTER TABLE public.outfit_ratings ENABLE ROW LEVEL SECURITY;

-- Keep updated_at current
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_outfit_ratings_updated_at ON public.outfit_ratings;
CREATE TRIGGER trg_outfit_ratings_updated_at
BEFORE UPDATE ON public.outfit_ratings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- View ratings on public outfits or on your own outfits; raters see their own
CREATE POLICY "View ratings for public or own outfits"
  ON public.outfit_ratings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.outfits o
      WHERE o.id = outfit_id
        AND (o.is_public = true OR o.user_id = auth.uid())
    )
    OR user_id = auth.uid()
  );

-- Insert/update your rating on public outfits or your own outfits
CREATE POLICY "Rate public or own outfits (insert)"
  ON public.outfit_ratings
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.outfits o
      WHERE o.id = outfit_id
        AND (o.is_public = true OR o.user_id = auth.uid())
    )
  );

CREATE POLICY "Rate public or own outfits (update)"
  ON public.outfit_ratings
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.outfits o
      WHERE o.id = outfit_id
        AND (o.is_public = true OR o.user_id = auth.uid())
    )
  );

-- Users can delete their own rating
CREATE POLICY "Delete your rating"
  ON public.outfit_ratings
  FOR DELETE
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_outfit_ratings_outfit ON public.outfit_ratings (outfit_id);
CREATE INDEX IF NOT EXISTS idx_outfit_ratings_user ON public.outfit_ratings (user_id);

-- 5) Style preferences (for ML learning signals)
CREATE TABLE IF NOT EXISTS public.user_style_preferences (
  user_id uuid PRIMARY KEY,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  favorite_colors text[] DEFAULT '{}'::text[],
  disliked_colors text[] DEFAULT '{}'::text[],
  style_keywords text[] DEFAULT '{}'::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_style_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their preferences"
  ON public.user_style_preferences
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their preferences"
  ON public.user_style_preferences
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their preferences"
  ON public.user_style_preferences
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP TRIGGER IF EXISTS trg_user_style_preferences_updated_at ON public.user_style_preferences;
CREATE TRIGGER trg_user_style_preferences_updated_at
BEFORE UPDATE ON public.user_style_preferences
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6) Vision-enriched wardrobe metadata
ALTER TABLE public.wardrobe_items
  ADD COLUMN IF NOT EXISTS detected_labels jsonb,
  ADD COLUMN IF NOT EXISTS dominant_color text,
  ADD COLUMN IF NOT EXISTS color_palette jsonb;

-- 7) Fashion challenges/contests
CREATE TABLE IF NOT EXISTS public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  created_by uuid NOT NULL,
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Public can view public challenges; creators can view their own even if not public
CREATE POLICY "View public challenges or own"
  ON public.challenges
  FOR SELECT
  USING (is_public = true OR created_by = auth.uid());

-- Only creator can create/update/delete their challenges
CREATE POLICY "Create challenges"
  ON public.challenges
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Update own challenges"
  ON public.challenges
  FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Delete own challenges"
  ON public.challenges
  FOR DELETE
  USING (created_by = auth.uid());

DROP TRIGGER IF EXISTS trg_challenges_updated_at ON public.challenges;
CREATE TRIGGER trg_challenges_updated_at
BEFORE UPDATE ON public.challenges
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Entries to challenges
CREATE TABLE IF NOT EXISTS public.challenge_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL,
  outfit_id uuid NOT NULL,
  user_id uuid NOT NULL,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.challenge_entries ENABLE ROW LEVEL SECURITY;

-- View entries if the challenge is public, or if you're the creator or the entrant
CREATE POLICY "View entries for public challenges or involved"
  ON public.challenge_entries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.challenges c
      WHERE c.id = challenge_id
        AND (c.is_public = true OR c.created_by = auth.uid())
    )
    OR user_id = auth.uid()
  );

-- Entrants can submit to public challenges only (auth required)
CREATE POLICY "Submit entry to public challenge"
  ON public.challenge_entries
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.challenges c
      WHERE c.id = challenge_id AND c.is_public = true
    )
  );

-- Entrants or challenge creators can delete entries
CREATE POLICY "Delete entry (entrant or creator)"
  ON public.challenge_entries
  FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.challenges c
      WHERE c.id = challenge_id AND c.created_by = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_challenge_entries_challenge ON public.challenge_entries (challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_entries_outfit ON public.challenge_entries (outfit_id);

-- Votes for entries
CREATE TABLE IF NOT EXISTS public.challenge_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL,
  entry_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_vote UNIQUE (entry_id, user_id)
);

ALTER TABLE public.challenge_votes ENABLE ROW LEVEL SECURITY;

-- View votes for public challenges
CREATE POLICY "View votes for public challenges"
  ON public.challenge_votes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.challenges c
      WHERE c.id = challenge_id AND c.is_public = true
    )
  );

-- Only authenticated users can vote on public challenges during active window
CREATE POLICY "Vote on public challenge"
  ON public.challenge_votes
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.challenges c
      WHERE c.id = challenge_id AND c.is_public = true
    )
  );

-- Voters can remove their vote
CREATE POLICY "Remove your vote"
  ON public.challenge_votes
  FOR DELETE
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_challenge_votes_challenge ON public.challenge_votes (challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_votes_entry ON public.challenge_votes (entry_id);
CREATE INDEX IF NOT EXISTS idx_challenge_votes_user ON public.challenge_votes (user_id);

-- 8) Time-window validation triggers for entries & votes (use triggers, not CHECK)
CREATE OR REPLACE FUNCTION public.enforce_challenge_active_for_entry()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  s timestamptz;
  e timestamptz;
BEGIN
  SELECT start_at, end_at INTO s, e
  FROM public.challenges
  WHERE id = NEW.challenge_id;

  IF s IS NULL THEN
    RAISE EXCEPTION 'Challenge % not found', NEW.challenge_id;
  END IF;

  IF now() < s OR now() > e THEN
    RAISE EXCEPTION 'Submissions are closed for this challenge';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_challenge_entries_active ON public.challenge_entries;
CREATE TRIGGER trg_challenge_entries_active
BEFORE INSERT ON public.challenge_entries
FOR EACH ROW EXECUTE FUNCTION public.enforce_challenge_active_for_entry();

CREATE OR REPLACE FUNCTION public.enforce_challenge_active_for_vote()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  s timestamptz;
  e timestamptz;
  entry_challenge uuid;
BEGIN
  SELECT e.challenge_id INTO entry_challenge
  FROM public.challenge_entries e
  WHERE e.id = NEW.entry_id;

  IF entry_challenge IS NULL THEN
    RAISE EXCEPTION 'Entry % not found', NEW.entry_id;
  END IF;

  -- Ensure the vote challenge_id matches the entry's challenge_id
  IF NEW.challenge_id <> entry_challenge THEN
    RAISE EXCEPTION 'Vote challenge_id does not match entry''s challenge';
  END IF;

  SELECT c.start_at, c.end_at INTO s, e
  FROM public.challenges c
  WHERE c.id = NEW.challenge_id;

  IF s IS NULL THEN
    RAISE EXCEPTION 'Challenge % not found', NEW.challenge_id;
  END IF;

  IF now() < s OR now() > e THEN
    RAISE EXCEPTION 'Voting is closed for this challenge';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_challenge_votes_active ON public.challenge_votes;
CREATE TRIGGER trg_challenge_votes_active
BEFORE INSERT ON public.challenge_votes
FOR EACH ROW EXECUTE FUNCTION public.enforce_challenge_active_for_vote();
