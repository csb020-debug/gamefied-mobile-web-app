import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Plus, 
  UserPlus, 
  Calendar,
  CheckCircle,
  Clock,
  Target,
  MessageSquare,
  Star,
  Settings,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CollaborationGroup {
  id: string;
  name: string;
  description: string;
  group_type: string;
  max_members: number;
  is_active: boolean;
  created_at: string;
  members_count: number;
  activities_count: number;
}

interface GroupMember {
  id: string;
  student_id: string;
  nickname: string;
  role: string;
  joined_at: string;
}

interface GroupActivity {
  id: string;
  title: string;
  description: string;
  activity_type: string;
  due_date: string | null;
  is_completed: boolean;
  created_at: string;
}

interface CollaborationGroupsProps {
  classId: string;
  className: string;
}

const CollaborationGroups: React.FC<CollaborationGroupsProps> = ({ classId, className }) => {
  const [groups, setGroups] = useState<CollaborationGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<CollaborationGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [activities, setActivities] = useState<GroupActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchGroups();
  }, [classId]);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupMembers(selectedGroup.id);
      fetchGroupActivities(selectedGroup.id);
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('collaboration_groups')
        .select(`
          *,
          members_count:group_memberships(count),
          activities_count:group_activities(count)
        `)
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedGroups = (data || []).map(group => ({
        ...group,
        members_count: group.members_count?.[0]?.count || 0,
        activities_count: group.activities_count?.[0]?.count || 0
      }));

      setGroups(processedGroups);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupMembers = async (groupId: string) => {
    try {
      const { data, error } = await supabase
        .from('group_memberships')
        .select(`
          *,
          students!inner(nickname)
        `)
        .eq('group_id', groupId);

      if (error) throw error;

      const processedMembers = (data || []).map(membership => ({
        id: membership.id,
        student_id: membership.student_id,
        nickname: membership.students.nickname,
        role: membership.role,
        joined_at: membership.joined_at
      }));

      setMembers(processedMembers);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchGroupActivities = async (groupId: string) => {
    try {
      const { data, error } = await supabase
        .from('group_activities')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateGroup = async (formData: {
    name: string;
    description: string;
    group_type: string;
    max_members: number;
  }) => {
    try {
      const { error } = await supabase
        .from('collaboration_groups')
        .insert([{
          class_id: classId,
          created_by: user?.id,
          name: formData.name,
          description: formData.description,
          group_type: formData.group_type,
          max_members: formData.max_members
        }]);

      if (error) throw error;

      toast({
        title: "Group created!",
        description: "Your collaboration group has been created successfully.",
      });

      fetchGroups();
      setShowCreateDialog(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateActivity = async (formData: {
    title: string;
    description: string;
    activity_type: string;
    due_date: string | null;
  }) => {
    if (!selectedGroup) return;

    try {
      const { error } = await supabase
        .from('group_activities')
        .insert([{
          group_id: selectedGroup.id,
          created_by: user?.id,
          title: formData.title,
          description: formData.description,
          activity_type: formData.activity_type,
          due_date: formData.due_date
        }]);

      if (error) throw error;

      toast({
        title: "Activity created!",
        description: "New activity has been added to the group.",
      });

      fetchGroupActivities(selectedGroup.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getGroupTypeColor = (type: string) => {
    switch (type) {
      case 'study': return 'bg-blue-100 text-blue-800';
      case 'project': return 'bg-green-100 text-green-800';
      case 'discussion': return 'bg-purple-100 text-purple-800';
      case 'peer_review': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGroupTypeIcon = (type: string) => {
    switch (type) {
      case 'study': return <Users className="h-4 w-4" />;
      case 'project': return <Target className="h-4 w-4" />;
      case 'discussion': return <MessageSquare className="h-4 w-4" />;
      case 'peer_review': return <Star className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'task': return <CheckCircle className="h-4 w-4" />;
      case 'discussion': return <MessageSquare className="h-4 w-4" />;
      case 'review': return <Star className="h-4 w-4" />;
      case 'presentation': return <Target className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Collaboration Groups</h2>
          <p className="text-muted-foreground">Manage student collaboration and group work</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <CreateGroupDialog
              onCreateGroup={handleCreateGroup}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {!selectedGroup ? (
        /* Groups List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create collaboration groups to encourage peer learning
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Group
                </Button>
              </CardContent>
            </Card>
          ) : (
            groups.map((group) => (
              <Card 
                key={group.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedGroup(group)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getGroupTypeIcon(group.group_type)}
                      <Badge className={getGroupTypeColor(group.group_type)}>
                        {group.group_type}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(group.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {group.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Members</span>
                      <span className="font-medium">
                        {group.members_count}/{group.max_members}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Activities</span>
                      <span className="font-medium">{group.activities_count}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant={group.is_active ? "default" : "outline"}>
                        {group.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        /* Group Detail View */
        <div className="space-y-6">
          {/* Group Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedGroup(null)}
                  >
                    ← Back
                  </Button>
                  {getGroupTypeIcon(selectedGroup.group_type)}
                  <Badge className={getGroupTypeColor(selectedGroup.group_type)}>
                    {selectedGroup.group_type}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Created {new Date(selectedGroup.created_at).toLocaleDateString()}
                </div>
              </div>
              <CardTitle className="text-xl">{selectedGroup.name}</CardTitle>
              <CardDescription>{selectedGroup.description}</CardDescription>
            </CardHeader>
          </Card>

          <Tabs defaultValue="members" className="space-y-4">
            <TabsList>
              <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
              <TabsTrigger value="activities">Activities ({activities.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Group Members</CardTitle>
                    <Button size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {members.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        No members yet
                      </p>
                    ) : (
                      members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold">
                                {member.nickname.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{member.nickname}</div>
                              <div className="text-sm text-muted-foreground capitalize">
                                {member.role}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Joined {new Date(member.joined_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activities" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Group Activities</CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Activity
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <CreateActivityDialog
                          onCreateActivity={handleCreateActivity}
                          onCancel={() => {}}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activities.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        No activities yet
                      </p>
                    ) : (
                      activities.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                          <div className="mt-1">
                            {getActivityTypeIcon(activity.activity_type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{activity.title}</h4>
                              <Badge variant={activity.is_completed ? "default" : "outline"}>
                                {activity.is_completed ? 'Completed' : 'Pending'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {activity.description}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                              <span className="capitalize">{activity.activity_type}</span>
                              {activity.due_date && (
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Due: {new Date(activity.due_date).toLocaleDateString()}
                                </span>
                              )}
                              <span>
                                Created: {new Date(activity.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

// Create Group Dialog Component
const CreateGroupDialog: React.FC<{
  onCreateGroup: (data: any) => void;
  onCancel: () => void;
}> = ({ onCreateGroup, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    group_type: 'study',
    max_members: 6
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onCreateGroup(formData);
  };

  return (
    <DialogHeader>
      <DialogTitle>Create Collaboration Group</DialogTitle>
      <DialogDescription>
        Set up a new group for student collaboration
      </DialogDescription>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Group Name *</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Group name..."
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the group's purpose..."
            rows={3}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Group Type</label>
          <select
            value={formData.group_type}
            onChange={(e) => setFormData({ ...formData, group_type: e.target.value })}
            className="w-full p-2 border rounded-md"
          >
            <option value="study">Study Group</option>
            <option value="project">Project Group</option>
            <option value="discussion">Discussion Group</option>
            <option value="peer_review">Peer Review Group</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Max Members</label>
          <Input
            type="number"
            min="2"
            max="12"
            value={formData.max_members}
            onChange={(e) => setFormData({ ...formData, max_members: parseInt(e.target.value) })}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Create Group</Button>
        </div>
      </form>
    </DialogHeader>
  );
};

// Create Activity Dialog Component
const CreateActivityDialog: React.FC<{
  onCreateActivity: (data: any) => void;
  onCancel: () => void;
}> = ({ onCreateActivity, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    activity_type: 'task',
    due_date: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onCreateActivity({
      ...formData,
      due_date: formData.due_date || null
    });
  };

  return (
    <DialogHeader>
      <DialogTitle>Create Group Activity</DialogTitle>
      <DialogDescription>
        Add a new activity for the group to work on
      </DialogDescription>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Activity Title *</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Activity title..."
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the activity..."
            rows={3}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Activity Type</label>
          <select
            value={formData.activity_type}
            onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
            className="w-full p-2 border rounded-md"
          >
            <option value="task">Task</option>
            <option value="discussion">Discussion</option>
            <option value="review">Review</option>
            <option value="presentation">Presentation</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Due Date (Optional)</label>
          <Input
            type="datetime-local"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Create Activity</Button>
        </div>
      </form>
    </DialogHeader>
  );
};

export default CollaborationGroups;
