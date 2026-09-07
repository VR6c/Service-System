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

  const loadAll = () => {
    const loadedUsers = StorageService.getUsers();
    const loadedBrands = StorageService.getBrands();
    const loadedBranches = StorageService.getBranches();
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
      u => u.email.toLowerCase() === email.toLowerCase() && (password ? u.password === password : true)
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
    localStorage.removeItem('byd_current_user');
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

  const addUser = (userData: Omit<User, 'id' | 'created_date'>) => {
    const newUser: User = {
      ...userData,
      id: `u-${Date.now()}`,
      created_date: new Date().toISOString().split('T')[0]
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    StorageService.saveUsers(updatedUsers);
  };

  const updateUser = (id: string, updatedFields: Partial<User>) => {
    const updatedUsers = users.map(u => (u.id === id ? { ...u, ...updatedFields } : u));
    setUsers(updatedUsers);
    StorageService.saveUsers(updatedUsers);
    if (currentUser?.id === id) {
      const updatedCurrent = { ...currentUser, ...updatedFields };
      setCurrentUser(updatedCurrent);
      StorageService.setCurrentUser(updatedCurrent);
    }
  };

  const deleteUser = (id: string) => {
    const updatedUsers = users.filter(u => u.id !== id);
    setUsers(updatedUsers);
    StorageService.saveUsers(updatedUsers);
  };

  const refreshBrandsAndBranches = () => {
    setBrands(StorageService.getBrands());
    setBranches(StorageService.getBranches());
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
