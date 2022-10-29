import { select, selectAll } from 'd3-selection';
import { axisBottom, axisLeft } from 'd3-axis';
import { json } from 'd3-fetch';
import { scaleLinear, scaleTime } from 'd3-scale';
import { transition } from 'd3-transition';
import { min, max, extent } from 'd3-array';
import { timeFormat } from 'd3-time-format';
//import dataset from '../cyclist-data.json' assert { type: 'json' };

import './index.css';

//variables
let url =
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';
let dataset = [];
let w = 940;
let h = 600;
let r = 6;

function getDateFromTime(time) {
  let minutesSeconds = time.split(':');
  // uses new Date(year,month,day,hour,minutes,seconds,milliseconds) syntax
  let date = new Date('', '', '', '', minutesSeconds[0], minutesSeconds[1], '');
  //console.log('date =', date);
  return date;
}

const tooltip = select('.container')
  .append('div')
  .attr('id', 'tooltip')
  .text('tooltip');
const title = select('.container')
  .append('div')
  .attr('id', 'title')
  .append('h1')
  .text('Doping Cases in Professional Bicycle Racing')
  .style('font-size', '32px')
  .style('margin-bottom', '1rem');

const svg = select('.container')
  .append('svg')
  .attr('width', w)
  .attr('height', h);
// fetch json and then work with dataset
json(url).then((data) => {
  dataset = [...data];

  // "Year" on x-axis
  const xScale = scaleLinear()
    .domain([
      min(dataset, (d) => d['Year'] - 1),
      max(dataset, (d) => d['Year'] + 1),
    ])
    .range([0, w - 30]);

  // "Time" on y-axis
  const yScale = scaleTime()
    .domain(extent(dataset, (d) => getDateFromTime(d['Time'])))
    .range([30, h - 30]);

  // Axes
  const xAxis = axisBottom(xScale).tickFormat(function (d, i) {
    return d;
  });
  // y-axis ticks
  const yFormat = timeFormat('%M:%S');
  //console.log('yFormat', yFormat(new Date()));
  const yAxis = axisLeft(yScale).tickFormat(yFormat);
  // appending x-axis to svg
  svg
    .append('g')
    .attr('id', 'x-axis')
    .style('transform', `translate(10px,${h - 30}px)`)
    .call(xAxis);
  // appending y-axis to svg
  svg
    .append('g')
    .attr('id', 'y-axis')
    .style('transform', `translate(40px,0)`)
    .call(yAxis);
  // y-axis label
  svg
    .append('g')
    .append('text')
    .text('Time in Minutes')
    .style('transform', 'translate(55px,255px) rotate(-90deg)')
    .style('font-size', '12px');

  const legend = svg
    .append('g')
    .attr('id', 'legend')
    .style('transform', 'translate(750px,260px)');

  const no_doping_legend = legend.append('g').attr('class', 'g-label');
  no_doping_legend
    .append('rect')
    .attr('width', 15)
    .attr('height', 15)
    .attr('x', 140)
    .attr('y', -12)
    .attr('fill', 'orange');
  no_doping_legend
    .append('text')
    .text('No Doping Allegations')
    .style('font-size', '12px');

  const doping_legend = legend.append('g').attr('class', 'g-label');
  doping_legend
    .append('rect')
    .attr('width', 15)
    .attr('height', 15)
    .attr('x', 140)
    .attr('y', 18)
    .attr('fill', 'cornflowerblue');
  doping_legend
    .append('text')
    .style('transform', 'translate(-50px,30px)')
    .text('Riders with Doping Allegations')
    .style('font-size', '12px');

  const dots = svg
    .selectAll('circle')
    .data(dataset)
    .enter()
    .append('circle')
    .attr('cx', (d) => xScale(d['Year']))
    .attr('cy', (d) => yScale(getDateFromTime(d['Time'])))
    .attr('r', r)
    .attr('class', 'dot')
    .style('fill', (d) => {
      if (d['Doping']) return 'cornflowerblue';
      return 'orange';
    })
    .style('stroke', 'black')
    .style('transform', 'translate(10px,0)')
    .attr('data-xvalue', (d) => d['Year'])
    .attr('data-yvalue', (d) => getDateFromTime(d['Time']).toISOString())
    .on('mouseover', function (event, d) {
      //console.log('d', d, 'e', e);
      const { Name, Nationality, Year, Time, Place, Doping } = d;
      const { pageX, pageY } = event;
      tooltip.attr('data-year', Year);
      tooltip.style('opacity', 1);
      tooltip.style('left', `${pageX + 5}px`);
      tooltip.style('top', `${pageY - 28}px`);
      tooltip.html(
        `<p>${Name}: ${Nationality}</p><p>Place: ${Place}</p><p>Year: ${Year}, Time: ${Time}</p><br/><p>${Doping}</p>`
      );
    })
    .on('mouseout', function (d, i) {
      tooltip.style('opacity', 0);
    });
});
