'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, type Profile, type UserRole, type AccountStatus } from '@/lib/supabase';
import Spinner from '@/components/Spinner';
import DashboardLayout from '@/components/DashboardLayout';

interface UserWithEmail extends Profile {
  email: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserWithEmail[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AccountStatus | 'all'>('all');
  
  // Modal
  const [selectedUser, setSelectedUser] = useState<UserWithEmail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/console');
      return;
    }

    // Vérifier le rôle
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'super_admin') {
      router.push('/');
      return;
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Récupérer tous les profils
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Récupérer les emails depuis auth.users
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non authentifié');

      // Récupérer les emails en utilisant la fonction RPC
      const usersWithEmails: UserWithEmail[] = await Promise.all(
        (profiles || []).map(async (profile) => {
          try {
            const { data: email, error } = await supabase
              .rpc('get_user_email', { user_id: profile.id });

            return {
              ...profile,
              email: error ? 'Email non disponible' : (email || 'Email non disponible')
            };
          } catch (err) {
            return {
              ...profile,
              email: 'Email non disponible'
            };
          }
        })
      );

      setUsers(usersWithEmails);
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message || 'Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filtre par recherche (nom, email, téléphone)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.full_name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.phone.includes(term)
      );
    }

    // Filtre par rôle
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const updateUserStatus = async (userId: string, newStatus: AccountStatus) => {
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;

      // Mettre à jour localement
      setUsers(users.map(user =>
        user.id === userId ? { ...user, status: newStatus } : user
      ));

      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      console.error('Erreur:', err);
      alert(`Erreur: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: AccountStatus) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800'
    };

    const labels = {
      active: 'Actif',
      inactive: 'Inactif',
      suspended: 'Suspendu'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getRoleBadge = (role: UserRole) => {
    const styles = {
      super_admin: 'bg-purple-100 text-purple-800',
      client: 'bg-blue-100 text-blue-800'
    };

    const labels = {
      super_admin: 'Super Admin',
      client: 'Client'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[role]}`}>
        {labels[role]}
      </span>
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-foreground">Gestion des utilisateurs</h1>
            <p className="text-gray-600 mt-1">
              {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Recherche */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nom, email, téléphone..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                />
              </div>

              {/* Filtre par rôle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                >
                  <option value="all">Tous les rôles</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="client">Client</option>
                </select>
              </div>

              {/* Filtre par statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as AccountStatus | 'all')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="suspended">Suspendu</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Table des utilisateurs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernière connexion
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-[var(--primary)] rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {user.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.phone}</div>
                        {user.address && (
                          <div className="text-sm text-gray-500">{user.address}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.last_login_at
                          ? new Date(user.last_login_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Jamais'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsModalOpen(true);
                          }}
                          className="text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors"
                        >
                          Gérer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de gestion */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">
              Gérer l'utilisateur
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm font-medium text-gray-700">Nom</p>
                <p className="text-base text-gray-900">{selectedUser.full_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="text-base text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Téléphone</p>
                <p className="text-base text-gray-900">{selectedUser.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Rôle</p>
                <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Statut actuel</p>
                <div className="mt-1">{getStatusBadge(selectedUser.status)}</div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Actions</p>
              
              {selectedUser.status === 'active' && (
                <>
                  <button
                    onClick={() => updateUserStatus(selectedUser.id, 'inactive')}
                    disabled={isUpdating}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Traitement...' : 'Désactiver le compte'}
                  </button>
                  <button
                    onClick={() => updateUserStatus(selectedUser.id, 'suspended')}
                    disabled={isUpdating}
                    className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Traitement...' : 'Suspendre le compte'}
                  </button>
                </>
              )}

              {selectedUser.status === 'inactive' && (
                <button
                  onClick={() => updateUserStatus(selectedUser.id, 'active')}
                  disabled={isUpdating}
                  className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Traitement...' : 'Activer le compte'}
                </button>
              )}

              {selectedUser.status === 'suspended' && (
                <button
                  onClick={() => updateUserStatus(selectedUser.id, 'active')}
                  disabled={isUpdating}
                  className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Traitement...' : 'Réactiver le compte'}
                </button>
              )}

              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedUser(null);
                }}
                className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
