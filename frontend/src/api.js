import axios from 'axios'

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
})

export const getPipelines    = () => API.get('/pipelines/')
export const createPipeline  = (data) => API.post('/pipelines/', data)
export const deletePipeline  = (id) => API.delete(`/pipelines/${id}/`)
export const triggerPipeline = (id) => API.post(`/pipelines/${id}/trigger/`)
export const getRuns         = (pipelineId) => API.get(`/runs/?pipeline=${pipelineId}`)