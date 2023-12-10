const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const workspaceController = require('../../controllers/workspace.controller');
const workspaceValidation = require('../../validations/workspace.validation');
const router = express.Router();

router
    .route('/')
    .get(auth(), workspaceController.getAllWorkspaces)
    .post(auth(), validate(workspaceValidation.workspace), workspaceController.createWorkspace)

router
    .route('/:id')
    .get(auth(), workspaceController.getWorkspaceById)
    .post(auth(), validate(workspaceController.my_workspace), workspaceController.getWorkspaceByUserId)
    .patch(auth(), validate(workspaceValidation.workspace), workspaceController.updateWorkspaceById)
    .delete(auth(), workspaceController.deleteWorkspaceById);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Project
 *   description: Generate Voices
 */

/**
 * @swagger
 * /projects/text2voice:
 *   post:
 *     summary: Generate voice file from text
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             properties:
 *               data:
 *                 type: object
 *             example:
 *               data: [{ type: "volume", value: 3 }]
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *               example:
 *                 url: https://aws.s3.com/cloned_voice.mp3
 *       "400":
 *         description: Failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: Failed to generate voice from text. Contact to admin.
 */
