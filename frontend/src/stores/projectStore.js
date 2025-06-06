import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../services/api';

export const useProjectStore = create(
  persist(
    (set, get) => ({
      // État
      projects: [],
      tasks: [],
      currentProject: null,
      currentTask: null,
      projectStats: {},
      taskStats: {},
      loading: false,
      error: null,
      lastUpdate: null,
      filters: {
        status: 'all',
        priority: 'all',
        assignedTo: 'all',
        dateRange: null
      },

      // Actions pour les projets
      fetchProjects: async (filters = {}) => {
        set({ loading: true, error: null });
        
        try {
          const params = new URLSearchParams();
          
          // Ajouter les filtres
          if (filters.status && filters.status !== 'all') {
            params.append('status', filters.status);
          }
          if (filters.priority && filters.priority !== 'all') {
            params.append('priority', filters.priority);
          }
          if (filters.assigned_to && filters.assigned_to !== 'all') {
            params.append('assigned_to', filters.assigned_to);
          }
          if (filters.structure_id) {
            params.append('structure_id', filters.structure_id);
          }
          if (filters.start_date) {
            params.append('start_date', filters.start_date);
          }
          if (filters.end_date) {
            params.append('end_date', filters.end_date);
          }
          
          const response = await api.get(`/projects?${params}`);
          
          if (response.data.success) {
            const projects = response.data.data || [];
            
            set({ 
              projects,
              loading: false,
              lastUpdate: new Date().toISOString()
            });
            
            // Calculer les statistiques
            get().calculateProjectStats(projects);
            
            return { success: true, data: projects };
          } else {
            throw new Error(response.data.message || 'Erreur lors du chargement');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Erreur lors du chargement des projets';
          
          set({ 
            error: errorMessage, 
            loading: false 
          });
          
          return { success: false, error: errorMessage };
        }
      },

      fetchProjectById: async (projectId) => {
        set({ loading: true, error: null });
        
        try {
          const response = await api.get(`/projects/${projectId}`);
          
          if (response.data.success) {
            const project = response.data.data;
            
            set({ 
              currentProject: project,
              loading: false
            });
            
            return { success: true, data: project };
          } else {
            throw new Error(response.data.message || 'Projet non trouvé');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Erreur lors du chargement du projet';
          
          set({ 
            error: errorMessage, 
            loading: false,
            currentProject: null
          });
          
          return { success: false, error: errorMessage };
        }
      },

      createProject: async (projectData) => {
        set({ error: null });
        
        try {
          // Validation des données
          const validationError = get().validateProjectData(projectData);
          if (validationError) {
            throw new Error(validationError);
          }
          
          const response = await api.post('/projects', projectData);
          
          if (response.data.success) {
            const newProject = response.data.data;
            
            set((state) => ({
              projects: [...state.projects, newProject],
              lastUpdate: new Date().toISOString()
            }));
            
            // Recalculer les statistiques
            get().calculateProjectStats(get().projects);
            
            return { success: true, data: newProject };
          } else {
            throw new Error(response.data.message || 'Erreur lors de la création');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la création du projet';
          
          set({ error: errorMessage });
          
          return { success: false, error: errorMessage };
        }
      },

      updateProject: async (projectId, projectData) => {
        set({ error: null });
        
        try {
          const response = await api.put(`/projects/${projectId}`, projectData);
          
          if (response.data.success) {
            const updatedProject = response.data.data;
            
            set((state) => ({
              projects: state.projects.map(project => 
                project.id === projectId ? updatedProject : project
              ),
              currentProject: state.currentProject?.id === projectId ? updatedProject : state.currentProject,
              lastUpdate: new Date().toISOString()
            }));
            
            return { success: true, data: updatedProject };
          } else {
            throw new Error(response.data.message || 'Erreur lors de la mise à jour');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la mise à jour du projet';
          
          set({ error: errorMessage });
          
          return { success: false, error: errorMessage };
        }
      },

      deleteProject: async (projectId) => {
        set({ error: null });
        
        try {
          const response = await api.delete(`/projects/${projectId}`);
          
          if (response.data.success) {
            set((state) => ({
              projects: state.projects.filter(project => project.id !== projectId),
              currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
              tasks: state.tasks.filter(task => task.project_id !== projectId),
              lastUpdate: new Date().toISOString()
            }));
            
            // Recalculer les statistiques
            get().calculateProjectStats(get().projects);
            
            return { success: true };
          } else {
            throw new Error(response.data.message || 'Erreur lors de la suppression');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la suppression du projet';
          
          set({ error: errorMessage });
          
          return { success: false, error: errorMessage };
        }
      },

      // Actions pour les tâches
      fetchTasks: async (projectId = null, filters = {}) => {
        set({ loading: true, error: null });
        
        try {
          const params = new URLSearchParams();
          
          if (projectId) {
            params.append('project_id', projectId);
          }
          
          // Ajouter les filtres
          if (filters.status && filters.status !== 'all') {
            params.append('status', filters.status);
          }
          if (filters.priority && filters.priority !== 'all') {
            params.append('priority', filters.priority);
          }
          if (filters.assigned_to && filters.assigned_to !== 'all') {
            params.append('assigned_to', filters.assigned_to);
          }
          
          const endpoint = projectId ? `/tasks/project/${projectId}` : '/tasks';
          const response = await api.get(`${endpoint}?${params}`);
          
          if (response.data.success) {
            const tasks = response.data.data || [];
            
            set({ 
              tasks,
              loading: false,
              lastUpdate: new Date().toISOString()
            });
            
            // Calculer les statistiques des tâches
            get().calculateTaskStats(tasks);
            
            return { success: true, data: tasks };
          } else {
            throw new Error(response.data.message || 'Erreur lors du chargement');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Erreur lors du chargement des tâches';
          
          set({ 
            error: errorMessage, 
            loading: false 
          });
          
          return { success: false, error: errorMessage };
        }
      },

      fetchTaskById: async (taskId) => {
        set({ loading: true, error: null });
        
        try {
          const response = await api.get(`/tasks/${taskId}`);
          
          if (response.data.success) {
            const task = response.data.data;
            
            set({ 
              currentTask: task,
              loading: false
            });
            
            return { success: true, data: task };
          } else {
            throw new Error(response.data.message || 'Tâche non trouvée');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Erreur lors du chargement de la tâche';
          
          set({ 
            error: errorMessage, 
            loading: false,
            currentTask: null
          });
          
          return { success: false, error: errorMessage };
        }
      },

      createTask: async (taskData) => {
        set({ error: null });
        
        try {
          // Validation des données
          const validationError = get().validateTaskData(taskData);
          if (validationError) {
            throw new Error(validationError);
          }
          
          const response = await api.post('/tasks', taskData);
          
          if (response.data.success) {
            const newTask = response.data.data;
            
            set((state) => ({
              tasks: [...state.tasks, newTask],
              lastUpdate: new Date().toISOString()
            }));
            
            // Recalculer les statistiques
            get().calculateTaskStats(get().tasks);
            
            return { success: true, data: newTask };
          } else {
            throw new Error(response.data.message || 'Erreur lors de la création');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la création de la tâche';
          
          set({ error: errorMessage });
          
          return { success: false, error: errorMessage };
        }
      },

      updateTask: async (taskId, taskData) => {
        set({ error: null });
        
        try {
          const response = await api.put(`/tasks/${taskId}`, taskData);
          
          if (response.data.success) {
            const updatedTask = response.data.data;
            
            set((state) => ({
              tasks: state.tasks.map(task => 
                task.id === taskId ? updatedTask : task
              ),
              currentTask: state.currentTask?.id === taskId ? updatedTask : state.currentTask,
              lastUpdate: new Date().toISOString()
            }));
            
            return { success: true, data: updatedTask };
          } else {
            throw new Error(response.data.message || 'Erreur lors de la mise à jour');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la mise à jour de la tâche';
          
          set({ error: errorMessage });
          
          return { success: false, error: errorMessage };
        }
      },

      deleteTask: async (taskId) => {
        set({ error: null });
        
        try {
          const response = await api.delete(`/tasks/${taskId}`);
          
          if (response.data.success) {
            set((state) => ({
              tasks: state.tasks.filter(task => task.id !== taskId),
              currentTask: state.currentTask?.id === taskId ? null : state.currentTask,
              lastUpdate: new Date().toISOString()
            }));
            
            // Recalculer les statistiques
            get().calculateTaskStats(get().tasks);
            
            return { success: true };
          } else {
            throw new Error(response.data.message || 'Erreur lors de la suppression');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la suppression de la tâche';
          
          set({ error: errorMessage });
          
          return { success: false, error: errorMessage };
        }
      },

      // Actions de gestion des assignations
      assignUserToProject: async (projectId, userId, role = 'member') => {
        try {
          const response = await api.post(`/projects/${projectId}/assignments`, {
            user_id: userId,
            role
          });
          
          if (response.data.success) {
            // Recharger le projet pour avoir les assignations à jour
            await get().fetchProjectById(projectId);
            
            return { success: true };
          } else {
            throw new Error(response.data.message || 'Erreur lors de l\'assignation');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de l\'assignation';
          
          set({ error: errorMessage });
          
          return { success: false, error: errorMessage };
        }
      },

      removeUserFromProject: async (projectId, userId) => {
        try {
          const response = await api.delete(`/projects/${projectId}/assignments/${userId}`);
          
          if (response.data.success) {
            // Recharger le projet pour avoir les assignations à jour
            await get().fetchProjectById(projectId);
            
            return { success: true };
          } else {
            throw new Error(response.data.message || 'Erreur lors de la suppression');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la suppression de l\'assignation';
          
          set({ error: errorMessage });
          
          return { success: false, error: errorMessage };
        }
      },

      // Validation des données
      validateProjectData: (projectData) => {
        if (!projectData.title || projectData.title.trim().length < 3) {
          return 'Le titre du projet doit contenir au moins 3 caractères';
        }
        
        if (!projectData.start_date) {
          return 'La date de début est obligatoire';
        }
        
        if (!projectData.end_date) {
          return 'La date de fin est obligatoire';
        }
        
        if (new Date(projectData.start_date) >= new Date(projectData.end_date)) {
          return 'La date de fin doit être postérieure à la date de début';
        }
        
        if (!projectData.status || !['planned', 'in_progress', 'completed', 'cancelled'].includes(projectData.status)) {
          return 'Statut du projet invalide';
        }
        
        if (!projectData.priority || !['low', 'medium', 'high', 'urgent'].includes(projectData.priority)) {
          return 'Priorité du projet invalide';
        }
        
        return null;
      },

      validateTaskData: (taskData) => {
        if (!taskData.title || taskData.title.trim().length < 3) {
          return 'Le titre de la tâche doit contenir au moins 3 caractères';
        }
        
        if (!taskData.project_id) {
          return 'Le projet est obligatoire';
        }
        
        if (!taskData.status || !['todo', 'in_progress', 'completed', 'cancelled'].includes(taskData.status)) {
          return 'Statut de la tâche invalide';
        }
        
        if (!taskData.priority || !['low', 'medium', 'high', 'urgent'].includes(taskData.priority)) {
          return 'Priorité de la tâche invalide';
        }
        
        if (taskData.due_date && new Date(taskData.due_date) < new Date()) {
          return 'La date d\'échéance ne peut pas être dans le passé';
        }
        
        return null;
      },

      // Calculs de statistiques
      calculateProjectStats: (projects) => {
        const stats = {
          total: projects.length,
          planned: 0,
          inProgress: 0,
          completed: 0,
          cancelled: 0,
          byPriority: {
            low: 0,
            medium: 0,
            high: 0,
            urgent: 0
          },
          completionRate: 0
        };
        
        projects.forEach(project => {
          stats[project.status === 'in_progress' ? 'inProgress' : project.status]++;
          stats.byPriority[project.priority]++;
        });
        
        if (stats.total > 0) {
          stats.completionRate = Math.round((stats.completed / stats.total) * 100);
        }
        
        set({ projectStats: stats });
      },

      calculateTaskStats: (tasks) => {
        const stats = {
          total: tasks.length,
          todo: 0,
          inProgress: 0,
          completed: 0,
          cancelled: 0,
          overdue: 0,
          byPriority: {
            low: 0,
            medium: 0,
            high: 0,
            urgent: 0
          },
          completionRate: 0
        };
        
        const now = new Date();
        
        tasks.forEach(task => {
          stats[task.status === 'in_progress' ? 'inProgress' : task.status]++;
          stats.byPriority[task.priority]++;
          
          // Vérifier si la tâche est en retard
          if (task.due_date && new Date(task.due_date) < now && task.status !== 'completed') {
            stats.overdue++;
          }
        });
        
        if (stats.total > 0) {
          stats.completionRate = Math.round((stats.completed / stats.total) * 100);
        }
        
        set({ taskStats: stats });
      },

      // Getters et utilitaires
      getProjectById: (projectId) => {
        return get().projects.find(project => project.id === projectId);
      },

      getTaskById: (taskId) => {
        return get().tasks.find(task => task.id === taskId);
      },

      getTasksByProject: (projectId) => {
        return get().tasks.filter(task => task.project_id === projectId);
      },

      getProjectsByStatus: (status) => {
        return get().projects.filter(project => project.status === status);
      },

      getTasksByStatus: (status) => {
        return get().tasks.filter(task => task.status === status);
      },

      getProjectsByPriority: (priority) => {
        return get().projects.filter(project => project.priority === priority);
      },

      getTasksByPriority: (priority) => {
        return get().tasks.filter(task => task.priority === priority);
      },

      getOverdueTasks: () => {
        const now = new Date();
        return get().tasks.filter(task => 
          task.due_date && 
          new Date(task.due_date) < now && 
          task.status !== 'completed'
        );
      },

      getUserProjects: (userId) => {
        return get().projects.filter(project => 
          project.assigned_to === userId || 
          project.created_by === userId ||
          (project.team_members && project.team_members.some(member => member.id === userId))
        );
      },

      getUserTasks: (userId) => {
        return get().tasks.filter(task => task.assigned_to === userId);
      },

      searchProjects: (query) => {
        const normalizedQuery = query.toLowerCase().trim();
        
        return get().projects.filter(project => 
          project.title.toLowerCase().includes(normalizedQuery) ||
          (project.description && project.description.toLowerCase().includes(normalizedQuery))
        );
      },

      searchTasks: (query) => {
        const normalizedQuery = query.toLowerCase().trim();
        
        return get().tasks.filter(task => 
          task.title.toLowerCase().includes(normalizedQuery) ||
          (task.description && task.description.toLowerCase().includes(normalizedQuery))
        );
      },

      // Gestion des filtres
      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters }
        }));
      },

      clearFilters: () => {
        set({
          filters: {
            status: 'all',
            priority: 'all',
            assignedTo: 'all',
            dateRange: null
          }
        });
      },

      // Actions de gestion
      clearError: () => set({ error: null }),

      reset: () => set({
        projects: [],
        tasks: [],
        currentProject: null,
        currentTask: null,
        projectStats: {},
        taskStats: {},
        loading: false,
        error: null,
        lastUpdate: null,
        filters: {
          status: 'all',
          priority: 'all',
          assignedTo: 'all',
          dateRange: null
        }
      }),

      // Actions de bulk
      bulkUpdateProjects: async (projectIds, updateData) => {
        set({ error: null });
        
        try {
          const response = await api.put('/projects/bulk', {
            project_ids: projectIds,
            update_data: updateData
          });
          
          if (response.data.success) {
            // Recharger les projets
            await get().fetchProjects();
            
            return { success: true };
          } else {
            throw new Error(response.data.message || 'Erreur lors de la mise à jour en lot');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la mise à jour en lot';
          
          set({ error: errorMessage });
          
          return { success: false, error: errorMessage };
        }
      },

      bulkUpdateTasks: async (taskIds, updateData) => {
        set({ error: null });
        
        try {
          const response = await api.put('/tasks/bulk', {
            task_ids: taskIds,
            update_data: updateData
          });
          
          if (response.data.success) {
            // Recharger les tâches
            await get().fetchTasks();
            
            return { success: true };
          } else {
            throw new Error(response.data.message || 'Erreur lors de la mise à jour en lot');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la mise à jour en lot';
          
          set({ error: errorMessage });
          
          return { success: false, error: errorMessage };
        }
      }
    }),
    {
      name: 'project-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        filters: state.filters,
        lastUpdate: state.lastUpdate
      }),
    }
  )
);