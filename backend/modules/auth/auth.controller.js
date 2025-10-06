import { registerUser, loginUser } from './auth.service';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required ' });
    }

    const user = await registerUser({ name, email, password });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email | !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await loginUser({ email, password });
    res.json(user);
  } catch (error) {
    next(error);
  }
};
