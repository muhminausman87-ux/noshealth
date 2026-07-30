# Nos health Dashboard

Create a highly professional, modern, and clean clinical EHR dashboard prototype for nurses called "SyncCare EHR" (inspired by a streamlined, simplified version of Cerner/Oracle Health). 

The application must feature a prominent top navigation bar containing a dropdown menu or tab system to switch between three distinct clinical units: "Emergency Department (ED)", "Medical-Surg Floor", and "Intensive Care Unit (ICU)". 

When a user switches between these departments, the main dashboard UI should dynamically update to present a filtered, simplified view of patient data, eliminating EHR bloat and click fatigue.

Include a mock patient banner at the top showing static patient info: Name: John Doe, DOB: 05/14/1978, MRN: 987-654-321, Allergies: Penicillin.

Implement the dynamic departmental views as follows:

1. Emergency Department (ED) View:

- Focus on acute, immediate care. 

- Show 4 primary data widgets: 

  - "Chief Complaint & Acuity" (e.g., Chest pain radiating to left arm, ESI Level 2)

  - "Vital Signs (Last 2 Hours)" arranged in a clear timeline or grid (HR, BP, RR, O2 Sat, Temp)

  - "Stat Labs & Imaging Status" showing pending/completed statuses (e.g., Troponin: COMPLETED - ELEVATED, EKG: COMPLETED, Chest X-Ray: PENDING)

  - "Critical Alerts" highlighting allergies and isolation status.

- Ensure long-term longitudinal care plans or physical therapy notes are completely hidden in this view.

2. Medical-Surg Floor View:

- Focus on routine shift-to-shift management.

- Show 4 primary data widgets:

  - "Medication Administration Record (MAR)" listing scheduled morning medications with checkboxes or status indicators (e.g., Metoprolol 25mg - 08:00 Due)

  - "Daily Care Plan & Mobility Status" (e.g., Activity: Assist of 1 with walker, Diet: NPO after midnight)

  - "Shift-to-Shift Trend Lines" displaying 24-hour vitals trends

  - "Fluid Balance (Input/Output)" charting total ml in vs. total ml out.

- Ensure trauma flowsheets and minute-by-minute ventilator parameters are completely hidden.

3. Intensive Care Unit (ICU) View:

- Focus on critical, high-acuity monitoring.

- Show 4 primary data widgets:

  - "Continuous Hemodynamic Monitoring" (Real-time vitals grid with MAP, ICP, and arterial line simulations)

  - "Active IV Infusions & Drips" tracking titration doses (e.g., Norepinephrine at 0.05 mcg/kg/min, Propofol at 20 mcg/kg/min)

  - "Ventilator Settings & Multi-System Assessment" (Mode: AC, Rate: 14, PEEP: 5, FiO2: 40%)

  - "Recent Arterial Blood Gas (ABG) Lab Results".

- Ensure outpatient specialist recommendation letters and routine wellness screening reminders are completely hidden.

Global Floating Component:

In the bottom-right corner of the web application, embed a clean, interactive floating chat widget labeled "SyncCare AI Assistant". When clicked, it opens a chat panel where a user can type text messages. Set up the UI layout so it is ready to connect a backend webhook response later. 

Use a clean healthcare color palette: medical whites, soft grays, calming blues for navigation, and clear alert colors (amber/red) ONLY for critical clinical findings. Ensure the UI feels scannable, spacious, and stress-free for a busy nurse.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://noshealth.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f7b768e8-e990-4b71-a297-a368a8542112).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
