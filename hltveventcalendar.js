const hltvBaseUri = 'https://www.hltv.org';

function getCalendarStartText() {
  return 'BEGIN:VCALENDAR\n'+
         'CALSCALE:GREGORIAN\n'+
         'METHOD:PUBLISH\n'+
         'PRODID:-//HLTV//EN\n'+
         'VERSION:2.0\n';
}

function getCalendarEndText(){
  return 'END:VCALENDAR';
}

function downloadIcsFile(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 
  'data:text/plain;charset=utf-8,'
  + encodeURIComponent(text));
  element.setAttribute('download', filename);
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function getEvents() {
  let events = [];
  let eventDays = document.getElementsByClassName("upcomingMatchesSection");

  for(let i = 0; i < eventDays.length; i++){
    let eventDate = eventDays[i].getElementsByClassName("matchDayHeadline")[0].innerText.slice(-10);
    let dayEvents = eventDays[i].getElementsByClassName("upcomingMatch");

    for(let j = 0; j < dayEvents.length; j++){
      let stars = dayEvents[j].getAttribute("stars");
      let uri = dayEvents[j].getElementsByClassName("match")[0].getAttribute("href");
      let method = dayEvents[j].getElementsByClassName("matchMeta")[0].innerText;
      let time = dayEvents[j].getElementsByClassName("matchTime")[0].innerText;
      let matchTitle = '';
      if (dayEvents[j].getElementsByClassName("matchInfoEmpty").length > 0) {
        matchTitle = dayEvents[j].getElementsByClassName("matchInfoEmpty")[0].innerText;
      } else {
        matchTitle = dayEvents[j].getElementsByClassName("team1")[0].innerText + ' vs. ' + dayEvents[j].getElementsByClassName("team2")[0].innerText;
      }

      events.push({date: eventDate, stars, method, uri, matchTitle, time});
    }
  }

  return events;
}

function getEventCalendarText(ev, fullDayEvent){
  let eventText = '';
  eventText+='BEGIN:VEVENT\n'+
             `UID:${ev.uri.split("/")[2]}\n`;

  let starsText = '';
  for(let i = 0; i < parseInt(ev.stars);i++){
    starsText+='★'
  }

  if (fullDayEvent) {
    eventText+=`DTSTART:${ev.date.replace(/-/g, "")}\n`+
               `SUMMARY:${ev.time} | ${starsText} | ${ev.matchTitle}\n`;
  } else {
    let startDate = new Date(`${ev.date} ${ev.time}`);
    let endDate = new Date(startDate);
    endDate.setTime(endDate.getTime() + parseInt(ev.method[2])*60*60000);
    eventText+=`DTSTART:${startDate.toISOString().replace(/-/g, "").replace(/:/g, "").replace(/\./g, "")}\n`+
               `DTEND:${endDate.toISOString().replace(/-/g, "").replace(/:/g, "").replace(/\./g, "")}\n`+
               `SUMMARY:${starsText} | ${ev.matchTitle}\n`;
  }

  eventText+=`DESCRIPTION:${ev.matchTitle}\n`+
             `LOCATION:${hltvBaseUri}${ev.uri}\n`+
             'END:VEVENT\n';

  return eventText;
}

function getCalendarName() {
  return document.getElementsByClassName("event-hub-title")[0].innerText;
}

function getCalendar(fullDayEvent) {
  let calendarText = getCalendarStartText();
  let events = getEvents();
  events.forEach(ev => {
    calendarText+=getEventCalendarText(ev, fullDayEvent);
  });
  calendarText+=getCalendarEndText();
  downloadIcsFile(`${getCalendarName()}.ics`, calendarText);
}

function addButton() {
  let headline = document.getElementsByClassName('upcoming-headline')[0];
  let div = document.createElement('div');
  let mainButton = document.createElement('a');
  mainButton.innerText = "Download calendar"
  mainButton.setAttribute("class", "block button text-center");
  mainButton.addEventListener('click', e => (getCalendar(false)));
  div.insertAdjacentElement('afterbegin', mainButton);
  let altDiv = document.createElement('div');
  let altButton = document.createElement('a');
  altButton.innerText = "Download calendar (all day events)"
  altButton.setAttribute("class", "block button text-center");
  altButton.addEventListener('click', e => (getCalendar(true)));
  altDiv.insertAdjacentElement('afterbegin', altButton);
  
  headline.insertAdjacentElement('afterend', altDiv);
  headline.insertAdjacentElement('afterend', div);
}
addButton();