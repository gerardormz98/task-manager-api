const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const { userOne, userTwo, taskOne, taskTwo, taskThree, setupDatabase } = require('./fixtures/db');

beforeEach(async () => {
    await setupDatabase();
});

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'Test task'
        })
        .expect(201);
    
    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.completed).toBe(false);
});

test('Should get all the task for user one', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    expect(response.body.length).toBe(2);
});

test('Should not delete task for another user', async () => {
    await request(app)
        .delete(`/task/${taskThree._id}`) //Belongs to second user
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(404);

    const task = await Task.findById(taskThree._id);
    expect(task).not.toBeNull();
})