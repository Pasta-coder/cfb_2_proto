
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bookmark } from "lucide-react";
import ProjectCard from "./ProjectCard";

const BookmarkedProjects = () => {
  const { user } = useAuth();

  const { data: bookmarkedProjects, isLoading } = useQuery({
    queryKey: ['bookmarked-projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          *,
          projects(
            *,
            profiles!projects_organizer_id_fkey(username, full_name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="bg-white/10 border-white/20 animate-pulse">
            <CardHeader>
              <div className="h-6 bg-white/20 rounded mb-2"></div>
              <div className="h-4 bg-white/20 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-white/20 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      {bookmarkedProjects && bookmarkedProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarkedProjects.map((bookmark) => (
            <ProjectCard key={bookmark.id} project={bookmark.projects} />
          ))}
        </div>
      ) : (
        <Card className="bg-white/10 border-white/20">
          <CardContent className="text-center py-12">
            <Bookmark className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <p className="text-gray-300">No bookmarked projects yet.</p>
            <p className="text-gray-400 text-sm mt-2">Bookmark projects you're interested in to see them here!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BookmarkedProjects;
