import {
  generateOrganizationJsonLd,
  generateWebsiteJsonLd,
  generateFAQJsonLd,
  generateSoftwareApplicationJsonLd,
} from '../seo';

describe('SEO Utils', () => {
  describe('generateOrganizationJsonLd', () => {
    it('should generate Organization schema', () => {
      const schema = generateOrganizationJsonLd();
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Organization');
      expect(schema.name).toBe('SyncStyle');
      expect(schema.url).toBeDefined();
    });
  });

  describe('generateWebsiteJsonLd', () => {
    it('should generate WebSite schema', () => {
      const schema = generateWebsiteJsonLd();
      
      expect(schema['@type']).toBe('WebSite');
      expect(schema.name).toBe('SyncStyle');
      expect(schema.potentialAction).toBeDefined();
    });
  });

  describe('generateFAQJsonLd', () => {
    it('should generate FAQ schema with default questions', () => {
      const schema = generateFAQJsonLd();
      
      expect(schema['@type']).toBe('FAQPage');
      expect(schema.mainEntity).toBeDefined();
      expect(Array.isArray(schema.mainEntity)).toBe(true);
    });

    it('should generate FAQ schema with custom questions', () => {
      const customFAQs = [
        { question: 'Test question?', answer: 'Test answer' }
      ];
      const schema = generateFAQJsonLd(customFAQs);
      
      expect(schema.mainEntity).toHaveLength(1);
      expect(schema.mainEntity[0].name).toBe('Test question?');
    });
  });

  describe('generateSoftwareApplicationJsonLd', () => {
    it('should generate SoftwareApplication schema', () => {
      const schema = generateSoftwareApplicationJsonLd();
      
      expect(schema['@type']).toBe('SoftwareApplication');
      expect(schema.name).toBe('SyncStyle');
      expect(schema.featureList).toBeDefined();
    });
  });
});
