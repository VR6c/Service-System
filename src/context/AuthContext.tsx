import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole, Brand, Branch } from '../types';
import { StorageService } from '../services/storageService';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  brands: Brand[];
  branches: Branch[];
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;
  switchActiveBrand: (brandId: string) => void;
  addUser: (user: Omit<User, 'id' | 'created_date'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  refreshBrandsAndBranches: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const loadAll = async () => {
    await StorageService.syncFromMongoDB();
    const loadedUsers = await StorageService.fetchUsers();
    const loadedBrands = await StorageService.fetchBrands();
    const loadedBranches = await StorageService.fetchBranches();
    setUsers(loadedUsers);
    setBrands(loadedBrands);
    setBranches(loadedBranches);
    const activeUser = StorageService.getCurrentUser();
    setCurrentUser(activeUser);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const login = (email: string, password?: string): boolean => {
    const loadedUsers = StorageService.getUsers();
    const user = loadedUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && (!password || u.password === password)
    );

    if (user && user.status === 'Active') {
      setCurrentUser(user);
      StorageService.setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    StorageService.setCurrentUser(null);
  };

  const switchRole = (targetRole: UserRole) => {
    const loadedUsers = StorageService.getUsers();
    const targetUser = loadedUsers.find(u => u.role === targetRole && u.status === 'Active') || loadedUsers[0];
    if (targetUser) {
      setCurrentUser(targetUser);
      StorageService.setCurrentUser(targetUser);
    }
  };

  const switchUser = (userId: string) => {
    const loadedUsers = StorageService.getUsers();
    const targetUser = loadedUsers.find(u => u.id === userId);
    if (targetUser) {
      setCurrentUser(targetUser);
      StorageService.setCurrentUser(targetUser);
    }
  };

  const switchActiveBrand = (brandId: string) => {
    if (!currentUser) return;
    const updatedUser: User = { ...currentUser, active_brand_id: brandId };
    setCurrentUser(updatedUser);
    StorageService.setCurrentUser(updatedUser);
    const loadedUsers = StorageService.getUsers();
    const updatedUsers = loadedUsers.map(u => (u.id === currentUser.id ? updatedUser : u));
    setUsers(updatedUsers);
    StorageService.saveUser(updatedUser);
  };

  const addUser = async (userData: Omit<User, 'id' | 'created_date'>) => {
    const newUser: User = {
      ...userData,
      id: `u-${Date.now()}`,
      created_date: new Date().toISOString().split('T')[0]
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    await StorageService.saveUser(newUser);
  };

  const updateUser = async (id: string, updatedFields: Partial<User>) => {
    const target = users.find(u => u.id === id);
    if (!target) return;
    const updatedUser = { ...target, ...updatedFields };
    const updatedUsers = users.map(u => (u.id === id ? updatedUser : u));
    setUsers(updatedUsers);
    await StorageService.saveUser(updatedUser);
    if (currentUser?.id === id) {
      setCurrentUser(updatedUser);
      StorageService.setCurrentUser(updatedUser);
    }
  };

  const deleteUser = async (id: string) => {
    const updatedUsers = users.filter(u => u.id !== id);
    setUsers(updatedUsers);
    await StorageService.deleteUser(id);
  };

  const refreshBrandsAndBranches = async () => {
    const b = await StorageService.fetchBrands();
    const br = await StorageService.fetchBranches();
    setBrands(b);
    setBranches(br);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        brands,
        branches,
        login,
        logout,
        switchRole,
        switchUser,
        switchActiveBrand,
        addUser,
        updateUser,
        deleteUser,
        refreshBrandsAndBranches
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
