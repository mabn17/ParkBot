# ParkBot Karlskrona
Is part of the **Individual software project** course at [Blekinge Institute of Technology](https://www.bth.se/eng/), Sweden

## Project Spec
An iOS / Android app that runs as a background service while driving a car. When the car is parked, the app makes a lookup in the municipality's street opening register to see if that street, on that side of the road, has a temporary parking ban in the near future. If so, a note is sent to the user.

Requirements:
1. Shall work on iOS or Android (or both)
2. Data
 * Shall use the city's street cleaning schedule, can be found [here](https://www.karlskrona.se/psidata)
 * Will in any way handle changes in the schedule
3. Other
 * When the user park the car, the app will automatically make a lookup in the cleaning schedule for the street, and present a descriptive warning to the user if a street opening will occur within 24 hours of parking time.
 * The app should not require to be in focus to work, it should be able to run in the background.
 * (Optional Challenge) Consider which side of the road the user parked on.

Requirements:
> Shall work on iOS or Android (or both)

> Data
> > Shall use the city's street cleaning schedule, can be found [here](https://www.karlskrona.se/psidata).
> > Will in any way handle changes in the schedule.

> Other
> > When the user park the car, the app will automatically make a lookup in the cleaning schedule for the street, and present a descriptive warning to the user if a street opening will occur within 24 hours of parking time.
> > The app should not require to be in focus to work, it should be able to run in the background.
> > (Optional Challenge) Consider which side of the road the user parked on.
