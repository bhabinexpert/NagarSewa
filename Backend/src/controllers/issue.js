// Issue Controller
import { Issue } from '../models/Issue.js';

// Create issue
export const createIssue = async (req, res) => {
  try {
    const issue = await Issue.create({
      ...req.body,
      user_id: req.user.id
    });
    res.status(201).json({ message: "Issue created", issue });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all issues
export const getIssues = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      ward: req.query.ward,
      priority: req.query.priority,
      user_id: req.query.user_id
    };
    const issues = await Issue.findAll(filters);
    res.json({ issues });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get issue by ID
export const getIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }
    res.json({ issue });
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update issue status (admin only)
export const updateIssueStatus = async (req, res) => {
  try {
    const { status, resolution_note } = req.body;
    const issue = await Issue.updateStatus(req.params.id, status, resolution_note);
    res.json({ message: "Issue updated", issue });
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update issue priority (super admin only)
export const updateIssuePriority = async (req, res) => {
  try {
    const { priority, priority_note } = req.body;
    const issue = await Issue.updatePriority(req.params.id, priority, priority_note);
    res.json({ message: "Priority updated", issue });
  } catch (error) {
    console.error('Update priority error:', error);
    res.status(500).json({ message: "Server error" });
  }
};
