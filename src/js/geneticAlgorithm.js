import { sin, floor, ceil, random, abs, min } from "mathjs";
import { SA } from "./simulatedAnnealing";

const varhi = 100;
const varlo = 0;

const maxit = 500;
const numberOfRuns = 10;
const n = 50; // number of iteration without improvement
const e = 0.01; // точность

const popsize = 12;
const mutRate = 0.4;
const selection = 0.5;

const keep = floor(selection * popsize); // the amount of chromosomes to keep
const M = ceil((popsize - keep) / 2); // number of matings

let functionCallsCounter = 0;

function ff(x, y) {
  functionCallsCounter++;

  return x * sin(4 * x) + 1.1 * y * sin(2 * y);
}

export function GA(ff) {
  const popData = [];

  // generating initial population
  for (let i = 0; i < popsize; i++) {
    const x = random(varlo, varhi);
    const y = random(varlo, varhi);

    popData[i] = { x, y, ff: ff(x, y) };
  }

  const popDataSeq = [popData];

  let iga = 0;
  let k = 0;

  const probDist = makeProbDist(keep, prob);

  while (iga < maxit && k < n) {
    iga++;

    const prevBest = popData[0];

    const selected = popData.sort((a, b) => a.ff - b.ff).slice(0, keep);

    popData.length = [];
    popData.push(...selected);

    for (let j = 0; j < M; j++) {
      const pick1 = selected[probDist(random())];
      const pick2 = selected[probDist(random())];

      crossover(pick1, pick2).forEach((newChr) => {
        const { x, y } = newChr;

        newChr.ff = ff(x, y);

        if (random() < mutRate) {
          popData.push(mutate(newChr));
        } else popData.push(newChr);
      });
    }

    popDataSeq.push(popData);

    const currBest = popData[0];

    // if no changes
    if (abs(prevBest.ff - currBest.ff) < e) k++;
    else k = 0;
  }

  console.log("number of iterations (GA):", iga);

  return { best: popData[0], popDataSeq };
}

function GAandSA(ff) {
  const ga = GA(ff);

  const saBest = SA(ff, varhi, varlo);

  console.log("Total number of target function calls: ", functionCallsCounter);

  console.log("Ga best", ga.best);

  console.log("SA best", saBest);

  return min(ga.best.ff, saBest);
}

console.log("Best solution for f(x,y) is ", GAandSA(ff));

function crossover(m, d) {
  const beta = random();

  if (random() < 0.5) {
    const xnew1 = (1 - beta) * m.x + beta * d.x;
    const xnew2 = beta * m.x + (1 - beta) * d.x;

    return [
      { x: xnew1, y: m.y },
      { x: xnew2, y: d.y },
    ];
  } else {
    const ynew1 = (1 - beta) * m.y + beta * d.y;
    const ynew2 = beta * m.y + (1 - beta) * d.y;

    return [
      { x: m.x, y: ynew1 },
      { x: d.x, y: ynew2 },
    ];
  }
}

function mutate(chr) {
  if (random() < 0.5) {
    chr.x = random(varlo, varhi);
  } else {
    chr.y = random(varlo, varhi);
  }

  return chr;
}

function prob(n) {
  const sumOfNaturalNums = ((1 + keep) * keep) / 2;

  return (keep - n + 1) / sumOfNaturalNums;
}

function makeProbDist(probAmount, prob) {
  const limits = [];

  limits[0] = 0;

  let sum = 0;

  for (let i = 1; i < probAmount; i++) {
    sum += prob(i);
    limits[i] = sum;
  }

  limits[probAmount] = 1;

  return function (x) {
    for (let i = 0; i < probAmount; i++) {
      if (limits[i] < x && x <= limits[i + 1]) return i;
    }
  };
}
