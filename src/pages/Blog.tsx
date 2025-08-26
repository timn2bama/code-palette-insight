import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Clock } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  published_at: string;
  tags: string[] | null;
  featured_image_url: string | null;
  author_id?: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // Use the secure public_blog_posts view for public access
      const { data, error } = await supabase
        .from('public_blog_posts')
        .select(`
          id,
          title,
          slug,
          excerpt,
          published_at,
          tags,
          featured_image_url
        `)
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button asChild variant="ghost" className="mb-6">
        <Link to="/">
          ← Back to Main Menu
        </Link>
      </Button>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">SyncStyle Blog</h1>
          <p className="text-muted-foreground">
            Weekly insights on fashion, style, and wardrobe management
          </p>
        </div>
        {user && (
          <Button asChild>
            <Link to="/blog/admin">Manage Posts</Link>
          </Button>
        )}
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No blog posts yet</h3>
            <p className="text-muted-foreground">
              Check back soon for our weekly style insights!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <Link to={`/blog/${post.slug}`}>
                {post.featured_image_url && (
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date().toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>SyncStyle Team</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {post.excerpt && (
                    <p className="text-muted-foreground line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>
                  )}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                      {post.tags.length > 3 && (
                        <Badge variant="outline">+{post.tags.length - 3}</Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}