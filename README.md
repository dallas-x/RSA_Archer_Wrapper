# .Sheldyn

## What is Sheldyn

Sheldyn started off as a little baby **powershell** script used for internal SOC use at CDT. Due to the lack of proper functioning tools a script was written to automatically create INC and correlated alerts in RSA's tool Archer for security analyst to investigate. Although this magical script did its job as intended, it had to grow up sometime. Sheldyn will be used until another solution is finalized by the "solutions" team. Sheldyn may very well live forever for other uses but will continue to grow until its no longer needed or wanted.

## What does Sheldyn do

Sheldyn's main function is to take event data from the DDI and create INC's and Alerts for analyst to investigate. Sheldyn does this by filtering out or removing irrelevant information from the data supplied and then giving this information to Archer. Sheldyn has some other uses such as ISO Tracker, Events, Dashboard, and Customer Center. **ISO Tracker** is used to track who has been notified, why they were notified, what actions were taken, and if the customer responded. **Events** shows users triggered events from the last 24 hours. **Customer Contact Center** will be a customer management portal that will allow analyst to track Incidents, events, customer's credit score, and all contact information. Customer's credit score is calculated based on the number INC's that has occurred. Repeated INC, response time, etc. As of May 2018 this feature is in the works.

## Motivation

Inspired by a few Military personnel we were simply not happy with what we were given. Being the first on the scene and most likely the first to leave we wanted to leave the SOC in better condition then how we found it. Repetitive task, inefficient ways of managing work, and the burden that excel sheets bring we wanted to create something that made our life easier so we can get back to doing the things that matter(like watching youtube videos).

## Installation

Please follow the wiki on installing [NodeJS](https://github.com/followthekoden/Sheldyn/wiki/Installing-NODEJS) and [Sheldyn](https://github.com/followthekoden/Sheldyn/wiki/Installing-Sheldyn).

You need private access to view this documentation.

## Contributors

**Dallas Baker** - *Developer* - [followthekoden](https://github.com/followthekoden)

**Austin Rose** - *Creator* - [auzroz](https://github.com/auzroz)

## License

This project is licensed under the MIT License
