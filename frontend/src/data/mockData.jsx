import React from 'react'

// Mock data for the waste management system

// Container data
export const containers = [
  {
    id: 'C001',
    location: '123 Main St',
    city: 'Greenville',
    area: 'Downtown',
    fillLevel: 85,
    lastUpdated: '2023-10-15T08:30:00',
    isErrorDetected: false,
    threshold: 90,
    collectionSchedule: 'Monday, Thursday',
  },
  {
    id: 'C002',
    location: '456 Park Ave',
    city: 'Greenville',
    area: 'Uptown',
    fillLevel: 92,
    lastUpdated: '2023-10-15T09:15:00',
    isErrorDetected: false,
    threshold: 90,
    collectionSchedule: 'Tuesday, Friday',
  },
  {
    id: 'C003',
    location: '789 Oak St',
    city: 'Riverdale',
    area: 'Central',
    fillLevel: 45,
    lastUpdated: '2023-10-15T10:00:00',
    isErrorDetected: false,
    threshold: 85,
    collectionSchedule: 'Wednesday, Saturday',
  },
  {
    id: 'C004',
    location: '101 Pine St',
    city: 'Riverdale',
    area: 'North',
    fillLevel: 78,
    lastUpdated: '2023-10-15T07:45:00',
    isErrorDetected: true,
    errorType: 'Sensor Malfunction',
    threshold: 85,
    collectionSchedule: 'Monday, Thursday',
  },
  {
    id: 'C005',
    location: '202 Maple Ave',
    city: 'Greenville',
    area: 'East',
    fillLevel: 30,
    lastUpdated: '2023-10-15T11:20:00',
    isErrorDetected: false,
    threshold: 90,
    collectionSchedule: 'Tuesday, Friday',
  },
  {
    id: 'C006',
    location: '303 Elm Blvd',
    city: 'Riverdale',
    area: 'West',
    fillLevel: 65,
    lastUpdated: '2023-10-15T12:10:00',
    isErrorDetected: false,
    threshold: 85,
    collectionSchedule: 'Wednesday, Saturday',
  },
  {
    id: 'C007',
    location: '404 Cedar Ln',
    city: 'Greenville',
    area: 'South',
    fillLevel: 50,
    lastUpdated: '2023-10-15T13:05:00',
    isErrorDetected: true,
    errorType: 'Network Connectivity',
    threshold: 90,
    collectionSchedule: 'Monday, Thursday',
  },
  {
    id: 'C008',
    location: '505 Birch St',
    city: 'Riverdale',
    area: 'Downtown',
    fillLevel: 88,
    lastUpdated: '2023-10-15T14:30:00',
    isErrorDetected: false,
    threshold: 85,
    collectionSchedule: 'Tuesday, Friday',
  },
]

// Pickup data
export const pickups = [
  {
    id: 'P001',
    containerId: 'C001',
    containerLocation: '123 Main St',
    city: 'Greenville',
    area: 'Downtown',
    status: 'Completed',
    assignedStaff: 'John Smith',
    scheduledDate: '2023-10-14T09:00:00',
    completedDate: '2023-10-14T09:45:00',
  },
  {
    id: 'P002',
    containerId: 'C002',
    containerLocation: '456 Park Ave',
    city: 'Greenville',
    area: 'Uptown',
    status: 'In Progress',
    assignedStaff: 'Maria Garcia',
    scheduledDate: '2023-10-15T10:00:00',
  },
  {
    id: 'P003',
    containerId: 'C008',
    containerLocation: '505 Birch St',
    city: 'Riverdale',
    area: 'Downtown',
    status: 'Scheduled',
    scheduledDate: '2023-10-16T11:30:00',
  },
  {
    id: 'P004',
    containerId: 'C003',
    containerLocation: '789 Oak St',
    city: 'Riverdale',
    area: 'Central',
    status: 'Scheduled',
    scheduledDate: '2023-10-16T14:00:00',
  },
  {
    id: 'P005',
    containerId: 'C006',
    containerLocation: '303 Elm Blvd',
    city: 'Riverdale',
    area: 'West',
    status: 'Completed',
    assignedStaff: 'Robert Johnson',
    scheduledDate: '2023-10-14T13:00:00',
    completedDate: '2023-10-14T13:50:00',
  },
  {
    id: 'P006',
    containerId: 'C004',
    containerLocation: '101 Pine St',
    city: 'Riverdale',
    area: 'North',
    status: 'Scheduled',
    scheduledDate: '2023-10-17T09:30:00',
  },
]

// Alert/Incident data
export const alerts = [
  {
    id: 'A001',
    containerId: 'C004',
    containerLocation: '101 Pine St',
    city: 'Riverdale',
    area: 'North',
    type: 'Sensor Error',
    description: 'Fill level sensor reporting inconsistent values',
    timestamp: '2023-10-15T07:45:00',
    resolved: false,
  },
  {
    id: 'A002',
    containerId: 'C007',
    containerLocation: '404 Cedar Ln',
    city: 'Greenville',
    area: 'South',
    type: 'Network Error',
    description: 'Container offline for more than 12 hours',
    timestamp: '2023-10-15T13:05:00',
    resolved: false,
  },
  {
    id: 'A003',
    containerId: 'C002',
    containerLocation: '456 Park Ave',
    city: 'Greenville',
    area: 'Uptown',
    type: 'Threshold Exceeded',
    description: 'Fill level above 90% threshold',
    timestamp: '2023-10-15T09:15:00',
    resolved: true,
    resolvedAt: '2023-10-15T10:30:00',
  },
  {
    id: 'A004',
    containerId: 'C008',
    containerLocation: '505 Birch St',
    city: 'Riverdale',
    area: 'Downtown',
    type: 'Threshold Exceeded',
    description: 'Fill level above 85% threshold',
    timestamp: '2023-10-15T14:30:00',
    resolved: false,
  },
]

// Staff data
export const staff = [
  { id: 'S001', name: 'John Smith', role: 'Collection Specialist', available: true },
  { id: 'S002', name: 'Maria Garcia', role: 'Collection Specialist', available: true },
  { id: 'S003', name: 'Robert Johnson', role: 'Collection Specialist', available: false },
  { id: 'S004', name: 'Lisa Chen', role: 'Collection Specialist', available: true },
  { id: 'S005', name: 'David Miller', role: 'Collection Specialist', available: true },
]

// Dashboard statistics
export const dashboardStats = {
  totalContainers: containers.length,
  containersNearFull: containers.filter((c) => c.fillLevel >= 80).length,
  scheduledPickups: pickups.filter((p) => p.status === 'Scheduled').length,
  completedPickups: pickups.filter((p) => p.status === 'Completed').length,
  activeAlerts: alerts.filter((a) => !a.resolved).length,
}

// Fill level distribution for charts
export const fillLevelDistribution = [
  { range: '0-20%', count: containers.filter((c) => c.fillLevel >= 0 && c.fillLevel < 20).length },
  { range: '20-40%', count: containers.filter((c) => c.fillLevel >= 20 && c.fillLevel < 40).length },
  { range: '40-60%', count: containers.filter((c) => c.fillLevel >= 40 && c.fillLevel < 60).length },
  { range: '60-80%', count: containers.filter((c) => c.fillLevel >= 60 && c.fillLevel < 80).length },
  { range: '80-100%', count: containers.filter((c) => c.fillLevel >= 80).length },
]

// Collection trends by day
export const collectionTrends = [
  { date: '2023-10-10', scheduled: 5, completed: 5 },
  { date: '2023-10-11', scheduled: 6, completed: 6 },
  { date: '2023-10-12', scheduled: 4, completed: 3 },
  { date: '2023-10-13', scheduled: 7, completed: 7 },
  { date: '2023-10-14', scheduled: 5, completed: 4 },
  { date: '2023-10-15', scheduled: 3, completed: 1 },
  { date: '2023-10-16', scheduled: 6, completed: 0 },
]

// Cities and areas for filters
export const cities = Array.from(new Set(containers.map((c) => c.city)))
export const areas = Array.from(new Set(containers.map((c) => c.area)))
