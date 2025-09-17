
import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  description: string;
  authors: string[];
  journal: string;
  year: number;
  url: string;
  tags: string[];
  category: 'diagnosis' | 'treatment' | 'research' | 'guidelines';
}

const articles: Article[] = [
  {
    id: '1',
    title: 'Transthyretin Amyloid Cardiomyopathy: Clinical Presentation and Diagnostic Challenges',
    description: 'A comprehensive review of ATTR-CM clinical manifestations, diagnostic criteria, and imaging techniques for early detection.',
    authors: ['Dr. Sarah Johnson', 'Dr. Michael Chen'],
    journal: 'Journal of Cardiology',
    year: 2024,
    url: '#',
    tags: ['diagnosis', 'imaging', 'clinical presentation'],
    category: 'diagnosis'
  },
  {
    id: '2',
    title: 'Novel Therapeutic Approaches in ATTR Cardiomyopathy Treatment',
    description: 'Recent advances in pharmacological interventions including TTR stabilizers and RNA interference therapies.',
    authors: ['Dr. Emily Rodriguez', 'Dr. James Wilson'],
    journal: 'Heart Failure Reviews',
    year: 2024,
    url: '#',
    tags: ['treatment', 'pharmacology', 'TTR stabilizers'],
    category: 'treatment'
  },
  {
    id: '3',
    title: 'Genetic Testing and Counseling in Hereditary ATTR Amyloidosis',
    description: 'Guidelines for genetic screening, family counseling, and management of at-risk individuals.',
    authors: ['Dr. Lisa Park', 'Dr. Robert Davis'],
    journal: 'Genetics in Medicine',
    year: 2023,
    url: '#',
    tags: ['genetics', 'counseling', 'screening'],
    category: 'guidelines'
  },
  {
    id: '4',
    title: 'Cardiac MRI in ATTR-CM: Advanced Imaging Techniques',
    description: 'Latest developments in cardiac magnetic resonance imaging for ATTR-CM diagnosis and monitoring.',
    authors: ['Dr. Amanda Foster', 'Dr. Kevin Lee'],
    journal: 'Cardiovascular Imaging',
    year: 2024,
    url: '#',
    tags: ['MRI', 'imaging', 'diagnosis'],
    category: 'diagnosis'
  },
  {
    id: '5',
    title: 'Biomarkers for Early Detection of ATTR Cardiomyopathy',
    description: 'Emerging blood biomarkers and their role in screening and monitoring disease progression.',
    authors: ['Dr. Thomas Anderson', 'Dr. Maria Garcia'],
    journal: 'Biomarker Research',
    year: 2023,
    url: '#',
    tags: ['biomarkers', 'screening', 'progression'],
    category: 'research'
  },
  {
    id: '6',
    title: 'Multidisciplinary Approach to ATTR-CM Patient Care',
    description: 'Best practices for coordinated care involving cardiology, neurology, and genetic counseling teams.',
    authors: ['Dr. Jennifer Brown', 'Dr. David Miller'],
    journal: 'Circulation',
    year: 2024,
    url: '#',
    tags: ['multidisciplinary', 'patient care', 'coordination'],
    category: 'guidelines'
  }
];

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase())) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'diagnosis': return 'bg-blue-100 text-blue-800';
      case 'treatment': return 'bg-green-100 text-green-800';
      case 'research': return 'bg-purple-100 text-purple-800';
      case 'guidelines': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8" style={{ color: '#29a8b6' }}>Resources</h1>
        
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">ATTR-CM Research Articles</h2>
            <p className="text-gray-600 mb-6">
              Access the latest research and clinical guidelines for Transthyretin Amyloid Cardiomyopathy
            </p>
            
            {/* Search and Filter Controls */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search articles, authors, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 sm:h-auto"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    selectedCategory === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedCategory('diagnosis')}
                  className={`px-3 py-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    selectedCategory === 'diagnosis' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Diagnosis
                </button>
                <button
                  onClick={() => setSelectedCategory('treatment')}
                  className={`px-3 py-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    selectedCategory === 'treatment' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Treatment
                </button>
                <button
                  onClick={() => setSelectedCategory('research')}
                  className={`px-3 py-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    selectedCategory === 'research' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Research
                </button>
                <button
                  onClick={() => setSelectedCategory('guidelines')}
                  className={`px-3 py-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    selectedCategory === 'guidelines' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Guidelines
                </button>
              </div>
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={`${getCategoryColor(article.category)} text-xs`}>
                      {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                    </Badge>
                    <span className="text-xs sm:text-sm text-gray-500">{article.year}</span>
                  </div>
                  <CardTitle className="text-base sm:text-lg leading-tight">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-600">
                    {article.journal} • {article.authors.join(', ')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-700 mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed">
                    {article.description}
                  </p>
                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                    {article.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium">
                    Read Article →
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No articles found matching your search criteria.</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your search terms or filters.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Resources;
