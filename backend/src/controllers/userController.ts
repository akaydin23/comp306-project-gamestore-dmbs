import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService.js';

//Function that happens when user tries to update profile
//Request from frontend, response and error forwarding
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //Reads the datas fronm frontend
    const { username, bio, profile_image_url } = req.body;

    //Logged in user's id,new username,new bio, new profile pic
    const user = await userService.updateProfile(
      req.user!.user_id,
      username,
      bio,
      profile_image_url
    );

    //send updated user back to frontedn
    res.json({ user });

    //if something goes wrong, an error handling
  } catch (err) {
    next(err);
  }
};