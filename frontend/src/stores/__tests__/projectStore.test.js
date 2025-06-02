import { useProjectStore } from '../projectStore'; // Adjust path
import api from '../../services/api'; // Adjust path

jest.mock('../../services/api');

describe('useProjectStore', () => {
  let initialState;

  beforeEach(() => {
    initialState = useProjectStore.getState();
    useProjectStore.setState(initialState, true);
    jest.clearAllMocks();
  });

  describe('createTask action', () => {
    it('should include estimated_time in the API call if provided', async () => {
      const mockTaskData = {
        title: 'Test Task with Est Time',
        project_id: 1,
        status: 'todo',
        priority: 'medium',
        estimated_time: '2.5', // Example: 2.5 hours
      };
      const mockApiResponse = { 
        success: true, 
        data: { ...mockTaskData, id: 1, estimated_time: 2.5 } // Assuming backend returns it as number
      };
      api.post.mockResolvedValue({ data: mockApiResponse });

      await useProjectStore.getState().createTask(mockTaskData);

      expect(api.post).toHaveBeenCalledWith('/tasks', expect.objectContaining({
        title: 'Test Task with Est Time',
        project_id: 1,
        status: 'todo',
        priority: 'medium',
        estimated_time: '2.5', // Sent as provided
      }));
      // Optionally, verify store update
      const state = useProjectStore.getState();
      expect(state.tasks.find(task => task.id === 1)?.estimated_time).toBe(2.5);
    });

    it('should not include estimated_time if not provided', async () => {
      const mockTaskData = {
        title: 'Test Task without Est Time',
        project_id: 1,
        status: 'todo',
        priority: 'medium',
      };
       const mockApiResponse = { 
        success: true, 
        data: { ...mockTaskData, id: 2 } 
      };
      api.post.mockResolvedValue({ data: mockApiResponse });

      await useProjectStore.getState().createTask(mockTaskData);

      expect(api.post).toHaveBeenCalledWith('/tasks', expect.objectContaining({
        title: 'Test Task without Est Time',
      }));
      expect(api.post.mock.calls[0][1].estimated_time).toBeUndefined();
    });

    it('should call validateTaskData and return error if validation fails', async () => {
        const mockTaskData = { title: '' }; // Invalid data
        const result = await useProjectStore.getState().createTask(mockTaskData);
        expect(api.post).not.toHaveBeenCalled();
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
  });

  describe('updateTask action', () => {
    it('should include estimated_time in the API call if provided for update', async () => {
      const taskId = 1;
      const mockTaskUpdateData = {
        estimated_time: '5',
        status: 'in_progress',
      };
      const mockApiResponse = { 
        success: true, 
        data: { id: taskId, title: 'Existing Task', ...mockTaskUpdateData, estimated_time: 5 } 
      };
      api.put.mockResolvedValue({ data: mockApiResponse });
      // Pre-populate store if update logic relies on existing task
      useProjectStore.setState({ tasks: [{ id: taskId, title: 'Existing Task', estimated_time: '2' }] });


      await useProjectStore.getState().updateTask(taskId, mockTaskUpdateData);

      expect(api.put).toHaveBeenCalledWith(`/tasks/${taskId}`, expect.objectContaining({
        estimated_time: '5',
        status: 'in_progress',
      }));
      const state = useProjectStore.getState();
      expect(state.tasks.find(task => task.id === 1)?.estimated_time).toBe(5);
    });

    it('should handle updates without estimated_time', async () => {
      const taskId = 1;
      const mockTaskUpdateData = {
        status: 'completed',
      };
       const mockApiResponse = { 
        success: true, 
        data: { id: taskId, title: 'Existing Task', status: 'completed', estimated_time: '2' } 
      };
      api.put.mockResolvedValue({ data: mockApiResponse });
      useProjectStore.setState({ tasks: [{ id: taskId, title: 'Existing Task', estimated_time: '2' }] });

      await useProjectStore.getState().updateTask(taskId, mockTaskUpdateData);

      expect(api.put).toHaveBeenCalledWith(`/tasks/${taskId}`, expect.objectContaining({
        status: 'completed',
      }));
      // estimated_time should not be part of the payload if not explicitly passed in updateData
      expect(api.put.mock.calls[0][1].estimated_time).toBeUndefined();
       const state = useProjectStore.getState();
      expect(state.tasks.find(task => task.id === 1)?.estimated_time).toBe('2'); // Remains unchanged
    });
  });

  describe('validateTaskData', () => {
    const validate = useProjectStore.getState().validateTaskData;

    it('should return null for valid data with estimated_time', () => {
        expect(validate({ title: 'Valid', project_id: 1, status: 'todo', priority: 'low', estimated_time: '5' })).toBeNull();
    });
    it('should return null for valid data without estimated_time', () => {
        expect(validate({ title: 'Valid', project_id: 1, status: 'todo', priority: 'low' })).toBeNull();
    });
    it('should return error for invalid estimated_time (negative)', () => {
        expect(validate({ title: 'Valid', project_id: 1, status: 'todo', priority: 'low', estimated_time: '-1' })).toBe('Le temps estimé doit être un nombre positif.');
    });
    it('should return error for invalid estimated_time (non-numeric)', () => {
        expect(validate({ title: 'Valid', project_id: 1, status: 'todo', priority: 'low', estimated_time: 'abc' })).toBe('Le temps estimé doit être un nombre positif.');
    });
     it('should return error for invalid title', () => {
        expect(validate({ title: '', project_id: 1, status: 'todo', priority: 'low' })).toContain('titre');
    });
  });
});
