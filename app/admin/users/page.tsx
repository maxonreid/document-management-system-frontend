'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  Users,
  FileText,
  FolderOpen,
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
  MoreVertical,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

interface UserStats {
  documentCount: number;
  folderCount: number;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'USER' | 'VIEWER';
  active: boolean;
  createdAt: string;
  updatedAt: string;
  stats: UserStats;
}

interface Statistics {
  totalUsers: number;
  totalDocuments: number;
  totalFolders: number;
  activeUsers: number;
}

type ActionType = 'role' | 'activate' | 'deactivate';

export default function AdminUsersPage() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');

  const [users, setUsers] = React.useState<User[]>([]);
  const [statistics, setStatistics] = React.useState<Statistics>({
    totalUsers: 0,
    totalDocuments: 0,
    totalFolders: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState(false);

  // Dialog states
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogAction, setDialogAction] = React.useState<ActionType | null>(null);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [selectedRole, setSelectedRole] = React.useState<'ADMIN' | 'USER' | 'VIEWER'>('USER');

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      const usersList = data.users || [];
      setUsers(usersList);

      // Calculate statistics
      const stats: Statistics = {
        totalUsers: usersList.length,
        totalDocuments: usersList.reduce((sum: number, user: User) => sum + user.stats.documentCount, 0),
        totalFolders: usersList.reduce((sum: number, user: User) => sum + user.stats.folderCount, 0),
        activeUsers: usersList.filter((user: User) => user.active).length,
      };
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(tCommon('error'));
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (action: ActionType, user: User) => {
    setDialogAction(action);
    setSelectedUser(user);
    if (action === 'role') {
      setSelectedRole(user.role);
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setDialogAction(null);
    setSelectedUser(null);
    setSelectedRole('USER');
  };

  const handleConfirmAction = async () => {
    if (!selectedUser || !dialogAction) return;

    setActionLoading(true);
    try {
      let updateData: any = {};

      switch (dialogAction) {
        case 'role':
          updateData = { role: selectedRole };
          break;
        case 'activate':
          updateData = { active: true };
          break;
        case 'deactivate':
          updateData = { active: false };
          break;
      }

      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      toast.success(tCommon('success'));
      await fetchUsers();
      closeDialog();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error instanceof Error ? error.message : tCommon('error'));
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-[#F2B705] text-[#0B2F4A]';
      case 'USER':
        return 'bg-[#0B2F4A] text-white';
      case 'VIEWER':
        return 'bg-[#6B7280] text-white';
      default:
        return 'bg-[#6B7280] text-white';
    }
  };

  const getDialogContent = () => {
    if (!selectedUser || !dialogAction) return null;

    switch (dialogAction) {
      case 'role':
        return {
          title: t('changeRole'),
          description: `Change role for ${selectedUser.name || selectedUser.email}`,
        };
      case 'activate':
        return {
          title: t('activateUser'),
          description: `Activate user ${selectedUser.name || selectedUser.email}?`,
        };
      case 'deactivate':
        return {
          title: t('deactivateUser'),
          description: `Deactivate user ${selectedUser.name || selectedUser.email}? They will not be able to log in.`,
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-[#0B2F4A] animate-spin" />
      </div>
    );
  }

  const dialogContent = getDialogContent();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#0B2F4A] mb-2">{t('userManagement')}</h1>
        <p className="text-[#6B7280]">Manage users, roles, and permissions</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">{t('totalUsers')}</p>
                <p className="text-2xl font-bold text-[#0B2F4A]">{statistics.totalUsers}</p>
              </div>
              <div className="h-12 w-12 bg-[#0B2F4A] rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Active Users</p>
                <p className="text-2xl font-bold text-[#0B2F4A]">{statistics.activeUsers}</p>
              </div>
              <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">{t('totalDocuments')}</p>
                <p className="text-2xl font-bold text-[#0B2F4A]">{statistics.totalDocuments}</p>
              </div>
              <div className="h-12 w-12 bg-[#F2B705] rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-[#0B2F4A]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">{t('totalFolders')}</p>
                <p className="text-2xl font-bold text-[#0B2F4A]">{statistics.totalFolders}</p>
              </div>
              <div className="h-12 w-12 bg-[#1F4E6D] rounded-lg flex items-center justify-center">
                <FolderOpen className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('users')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B7280]">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B7280]">
                    {t('role')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B7280]">
                    {t('status')}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B7280]">
                    Documents
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B7280]">
                    Folders
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#6B7280]">
                    Joined
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-[#6B7280]">
                    {tCommon('actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-[#E5E7EB] hover:bg-[#F5F7FA]">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-[#1A1A1A]">
                          {user.name || 'No name'}
                        </p>
                        <p className="text-sm text-[#6B7280]">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                          getRoleBadgeColor(user.role)
                        )}
                      >
                        {user.role === 'ADMIN' && <Shield className="h-3 w-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {user.active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3" />
                          {t('active')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="h-3 w-3" />
                          {t('inactive')}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#1A1A1A]">
                      {user.stats.documentCount}
                    </td>
                    <td className="py-3 px-4 text-[#1A1A1A]">
                      {user.stats.folderCount}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#6B7280]">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDialog('role', user)}>
                            {t('changeRole')}
                          </DropdownMenuItem>
                          {user.active ? (
                            <DropdownMenuItem
                              onClick={() => openDialog('deactivate', user)}
                              className="text-red-600"
                            >
                              {t('deactivateUser')}
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => openDialog('activate', user)}
                              className="text-green-600"
                            >
                              {t('activateUser')}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogContent?.title}</DialogTitle>
            <DialogDescription>{dialogContent?.description}</DialogDescription>
          </DialogHeader>

          {dialogAction === 'role' && (
            <div className="py-4">
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">{t('admin')}</SelectItem>
                  <SelectItem value="USER">{t('user')}</SelectItem>
                  <SelectItem value="VIEWER">{t('viewer')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={actionLoading}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleConfirmAction} disabled={actionLoading}>
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {tCommon('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
