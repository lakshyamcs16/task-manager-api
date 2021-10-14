const request = require('supertest');
const Task = require('../src/models/task');
const app = require('../src/app')
const { 
    userOne, 
    userOneId, 
    userTwo,
    userTwoId,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
 } = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should create task for user', async () => {
    const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'From my test'
        })
        .expect(201);
    
    const task = await Task.findById(res.body._id);
    expect(task).not.toBeNull();
    expect(task.completed).toEqual(false);
});

test('Should fetch correct tasks for a user', async () => {
    const res = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(200);
    
    expect(res.body.length).toBe(2);
})

test('Should NOT delete other user tasks', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .expect(404)
    
    const task  = await Task.findById(taskOne._id);
    expect(task).not.toBeNull();
})