# Market Research & Strategy Report: "whatcha-do.in"

**Date:** 2025-11-11
**Author:** Mary, Business Analyst

## 1. Introduction

This document summarizes the findings from the initial discovery and market research phase for the project "whatcha-do.in". The objective of this research was to validate the product concept, define the target market, analyze the competitive landscape, and establish a clear strategic vision for the Minimum Viable Product (MVP).

## 2. Market Analysis

The **Global Personal Productivity and Self-Improvement Market** is a large, robust, and growing sector.

*   **Market Size (2024):** Estimated between **$44 billion and $59 billion USD**. [Verified - 2+ sources]
*   **Growth Rate (CAGR):** Projected to grow at a strong **5% to 8.9%** annually. [Verified - 2+ sources]

### Key Market Trends:

1.  **AI Integration:** AI is becoming a core component of modern productivity tools, offering personalization, automation, and deeper user insights.
2.  **Holistic Wellness:** The market is shifting from simple task management to a broader focus on holistic well-being, including mental and emotional health.
3.  **Market Consolidation:** The space is maturing, with larger companies acquiring smaller apps, indicating a need for strong differentiation to succeed.

## 3. Target Customer Profile

*   **Segment Name:** "The Ambitious Underachiever"
*   **Core Identity:** High-aspiration individuals who want to achieve great things but are consistently hindered by a combination of procrastination, overthinking, and distractions.
*   **Key Pain Points:**
    *   They struggle with the "all-or-nothing" mentality, leading to inaction.
    *   They wait for the "perfect moment" to start, which never comes.
    *   They lose motivation when they break a streak or fail to meet their own high expectations.
*   **Core Desire:** To build a stronger identity and sense of self-worth through consistent, meaningful action. They value the principle of trusting in a higher power (as expressed by the user) through consistent effort.

## 4. Preliminary Competitive Analysis

A search of the current market identified several key players in two main categories:

*   **Specialized Habit Trackers:**
    *   Streaks
    *   Habitica
    *   Habitify
    *   Productive
    *   Way of Life
*   **General Productivity Tools:**
    *   Todoist
    *   Notion

A deep dive into the specific features of these competitors is recommended as a next step, but our initial hypothesis is that none are explicitly built around the "identity-formation" and "variable intensity" concepts we have defined.

## 5. Refined Product Vision & MVP Feature Set

### Core Philosophy
The app is not a simple to-do list; it is an **identity-building toolkit**. It helps users become the person they want to be through the power of consistent action.

### Core MVP Features

1.  **The "Two-Day Rule" Engine:** The foundational rule that a user must not miss more than one consecutive day of a chosen action.
2.  **Visual "Action Chips":** A simple, visual interface where each habit is an "action chip" that can be dragged to the current day.
3.  **Variable Intensity Recording:** When recording a completed action, the user is presented with a simple modal containing:
    *   An **Intensity Slider** (1-100, in increments of 20) to reflect the effort for that day.
    *   A **Duration** field.
    *   An optional **Notes** field.
4.  **"Today's Journal" Feed:** A simple feed that automatically compiles the notes from completed actions, creating a daily record of progress and reflection.
5.  **Motivational Quotes Widget:** A small, non-intrusive widget to provide daily encouragement.

## 6. Key Architectural Decision

Based on the need for user profiles and data persistence, a key strategic decision was made for the MVP:

*   **Architecture:** A **"Scalable MVP"** approach will be taken.
*   **Technology:** The application will be built with a **Database-as-a-Service (DBaaS)** backend to support user accounts, authentication, and data storage.
*   **Recommended DBaaS:** **Supabase** was identified as the preferred starting point due to its generous free tier and comprehensive features.
*   **Authentication Strategy:** To ensure a frictionless user experience and maximize sign-up conversion, **Magic Link logins** are recommended as the primary authentication method.

## 7. Conclusion & Next Steps

The "whatcha-do.in" concept is well-positioned to address a clear need within a large and growing market. Its unique philosophical core and innovative feature set provide a strong foundation for differentiation.

The recommended next step is to proceed to the **Planning Phase** of the BMM workflow. This involves engaging the **Project Manager (pm)** agent to develop a detailed **Product Requirements Document (PRD)** based on the findings in this report.
