const axios = require('axios');
const mongoose = require('mongoose');
const fs = require('fs');
const entities = require('entities');
const { Storage } = require('@google-cloud/storage');
const uuid = require('uuid');
const catchAsync = require('../utils/catchAsync');
const config = require('../config/config');
const { Workspace } = require('../models');
const { userService } = require('../services');

const createWorkspace = catchAsync( async (req, res) => {
  try {
    console.log(req.body);
    const workspace = new Workspace(req.body);
    await workspace.save();
    res.status(201).send(workspace);
  } catch (err) {
    res.status(500).send(err);
  }
})

const getAllWorkspaces = catchAsync( async(req, res) => {
  try {
    const workspaces = await Workspace.find();
    res.send(workspaces);
  } catch (err) {
    res.status(500).send(err);
  }
})

const getWorkspaceById = catchAsync( async (req, res) => {

  try {
    const workspace = await Workspace.findById(req.params.id);
    console.log(workspace);
    res.send(workspace);
  } catch(err) {
    res.status(500).send(err);
  }
})

const getWorkspaceByUserId = catchAsync( async (req, res) => {
  console.log(req.body.user_id);
  try {
    const workspaces = await Workspace.find({
      user_id: req.body.user_id
    });
    console.log(workspaces);
    res.send(workspaces);
  } catch (err) {
    res.status(500).send(err);
  }
})

const updateWorkspaceById = catchAsync( async (req, res) => {
  console.log('Updated');
  const { ObjectId } = mongoose.Types;
  const idToMatch = new ObjectId(req.params.id);

  console.log(req.body);

  try {
    const workspace = await Workspace.findOneAndUpdate(
      {
        user_id: req.body.user_id,
        _id: idToMatch,
      },
      {
        name: req.body.name,
        nodes: req.body.nodes,
        viewport: req.body.viewport,
      }
    )
    res.send(workspace);
  } catch (err) {
    res.status(500).send(err);
  }
})

const deleteWorkspaceById = catchAsync(async (req, res) => {
  try {
    const image = await Workspace.findByIdAndDelete(req.params.id);
    if (!image) return res.status(404).send();
    res.send(image);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = {
  getAllWorkspaces,
  createWorkspace,
  getWorkspaceById,
  updateWorkspaceById,
  deleteWorkspaceById,
  getWorkspaceByUserId
};
