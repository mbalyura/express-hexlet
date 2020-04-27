import Express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';

import Post from './entities/Post.js';
import NotFoundError from './errors/NotFoundError.js';

export default () => {
  const app = new Express();
  app.use(morgan(':method :url :status'));
  app.set('view engine', 'pug');
  // app.use('/assets', Express.static(process.env.NODE_PATH.split(':')[0]));
  app.use(methodOverride('_method'));
  app.use(bodyParser.urlencoded({ extended: false }));

  let posts = [
    new Post('hello', 'how are your?'),
    new Post('nodejs', 'story about nodejs'),
  ];

  app.get('/', (_req, res) => {
    res.render('index');
  });

  app.get('/posts', (_req, res) => {
    res.render('posts/index', { posts });
  });

  app.get('/posts/new', (_req, res) => {
    res.render('posts/new', { form: {}, errors: {} });
  });

  app.get('/posts/:id', (req, res, next) => {
    const post = posts.find((p) => p.id.toString() === req.params.id);
    if (post) {
      res.render('posts/show', { post });
    } else {
      next(new NotFoundError());
    }
  });

  app.post('/posts', (req, res) => {
    const { title, body } = req.body;

    const errors = {};
    if (!title) {
      errors.title = "Title can't be blank";
    }

    if (!body) {
      errors.body = "Body can't be blank";
    }

    if (Object.keys(errors).length === 0) {
      const post = new Post(title, body);
      posts.push(post);
      res.redirect(`/posts/${post.id}`);
      return;
    }

    res.status(422);
    res.render('posts/new', { form: req.body, errors });
  });

  // BEGIN 
  app.get('/posts/:id/edit', (req, res) => {
    const post = posts.find((p) => p.id.toString() === req.params.id);
    res.render('posts/edit', { form: { ...post }, errors: {} });
  });

  app.patch('/posts/:id', (req, res) => {
    const { title, body } = req.body;

    const errors = {};
    if (!title) errors.title = "Title can't be blank";
    if (!body) errors.body = "Body can't be blank";

    const post = posts.find((p) => p.id.toString() === req.params.id);

    if (Object.keys(errors).length === 0) {
      post.title = title;
      post.body = body;
      res.redirect('/posts');
      return;
    }

    res.status(422);
    res.render('posts/edit', { form: req.body, errors });
  });

  app.delete('/posts/:id', (req, res) => {
    posts = posts.filter((p) => p.id.toString() !== req.params.id);
    res.redirect('/posts').end();
  });
  // END

  // Errors handle
  app.use((_req, _res, next) => {
    next(new NotFoundError());
  });

  app.use((err, _req, res, next) => {
    res.status(err.status);
    switch (err.status) {
      case 404:
        res.render(err.status.toString());
        break;
      default:
        next(new Error('Unexpected error'));
    }
  });
  // END
  
  return app;
};
