const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { userOne, userOneId, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

test('should sign up a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Lakshya',
        email: 'apooos3@gmail.com',
        password: 'MyPass777!'
    }).expect(201);

    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    expect(response.body.user.name).toBe('Lakshya');
    expect(response.body).toMatchObject({
        user: {
            name: 'Lakshya',
            email: 'apooos3@gmail.com'
        },
        token: user.tokens[0].token
    });
    expect(user.password).not.toBe('MyPass777!')
});

test('Should login existing user', async () => {
    const response = await request(app).post('/user/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200);

    const user = await User.findById(response.body.user._id);
    expect(response.body).toMatchObject({
        token: user.tokens[user.tokens.length - 1].token
    });
});

test('Should NOT login existing user with wrong details', async () => {
    await request(app).post('/user/login').send({
        email: userOne.email ,
        password: 'aWrongPassword@1'
    }).expect(400);
});

test('Should get profile for user', async () => {
    await request(app)
            .get('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(200);
});

test('Should NOT get profile for user', async () => {
    await request(app)
            .get('/users/me')
            .send()
            .expect(401);
});

test('Should delete account for user if authenticated',  async () => {
    await request(app)
            .delete('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(200);

    const user = await User.findById(userOneId);
    expect(user).toBeNull();
})

test('Should NOT delete account for user if NOT authenticated',  async () => {
    await request(app)
            .delete('/users/me')
            .send()
            .expect(401);
});

test('Should upload avatar image', async () => {
    const testImage = `${__dirname}/fixtures/profile-pic.jpg`

    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', testImage)
        .expect(200);
    
    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Jess'
        })
        .expect(200)

    const user = await User.findById(userOneId);
    expect(user.name).toEqual('Jess');
});

test('Should NOT update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'Delhi'
        })
        .expect(400)
});