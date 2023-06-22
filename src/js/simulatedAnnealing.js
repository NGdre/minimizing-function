import { random, exp } from "mathjs";

const initTemp = 4e10;
const minTemp = 1e-10;
const a = 0.5;

export function SA(targetFunc, varhi = 10, varlo = 0) {
  const newState = () => ({ x: random(varlo, varhi), y: random(varlo, varhi) });

  const cooling = (T, a) => {
    if (a <= 0 || a >= 1) throw new Error("a must be in interval (0, 1)");

    return a * T;
  };

  let best = targetFunc(...Object.values(newState()));

  const seq = [];

  seq.push(best);

  let T = initTemp;

  let i = 0;

  while (T > minTemp) {
    const { x, y } = newState();

    const curr = targetFunc(x, y);

    const p = curr < best ? 1 : exp((best - curr) / T);

    T = cooling(T, a);

    if (random() <= p) {
      best = curr;
      seq.push(best);
    }

    i++;
  }

  console.log("number of iterations (SA):", i);

  console.log("Best solution for f(x,y) is ", best);

  return best;
}
