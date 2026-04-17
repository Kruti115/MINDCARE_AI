---
title: MindCare AI Backend
emoji: 🧠
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
---

# MindCare AI - Emotion Analysis Backend

Mental health monitoring system with AI-powered emotion detection.

## Features
- 5-emotion classification (Joy, Sadness, Anger, Anxiety, Neutral)
- Wellness score calculation
- Crisis detection
- RESTful API

## Endpoints
- `GET /` - Service info
- `GET /api/v1/health` - Health check
- `POST /api/v1/analyze-text` - Analyze text emotion

## Model
Uses fine-tuned BERT model: `Kruti1234/mindcare-text-emotion`