import type { Tool } from "ai";
import { z } from "zod";

export const mathTools: Record<string, Tool> = {
  "math-add": {
    description: "Adds two numbers together",
    parameters: z.object({
      firstNumber: z.number().describe("The first addend"),
      secondNumber: z.number().describe("The second addend"),
    }),
    async execute(args) {
      return Number(args.firstNumber) + Number(args.secondNumber);
    },
  },
  "math-subtract": {
    description: "Subtracts the second number from the first number",
    parameters: z.object({
      minuend: z.number().describe("The number to subtract from (minuend)"),
      subtrahend: z
        .number()
        .describe("The number being subtracted (subtrahend)"),
    }),
    async execute(args) {
      return Number(args.minuend) - Number(args.subtrahend);
    },
  },
  "math-multiply": {
    description: "Multiplies two numbers together",
    parameters: z.object({
      firstNumber: z.number().describe("The first number"),
      SecondNumber: z.number().describe("The second number"),
    }),
    async execute(args) {
      return Number(args.firstNumber) * Number(args.SecondNumber);
    },
  },
  "math-division": {
    description: "Divides the first number by the second number",
    parameters: z.object({
      numerator: z.number().describe("The number being divided (numerator)"),
      denominator: z.number().describe("The number to divide by (denominator)"),
    }),
    async execute(args) {
      return Number(args.numerator) / Number(args.denominator);
    },
  },
  "math-sum": {
    description: "Adds any number of numbers together",
    parameters: z.object({
      numbers: z.array(z.number()).min(1).describe("Array of numbers to sum"),
    }),
    async execute(args) {
      return args.numbers.reduce(
        (accumulator, currentValue) => accumulator + Number(currentValue),
        0
      );
    },
  },
  "math-mean": {
    description: "Calculates the arithmetic mean of a list of numbers",
    parameters: z.object({
      numbers: z
        .array(z.number())
        .min(1)
        .describe("Array of numbers to find the mean of"),
    }),
    async execute({ numbers }) {
      const sum = numbers.reduce(
        (accumulator, currentValue) => accumulator + Number(currentValue),
        0
      );
      const mean = sum / numbers.length;

      return mean;
    },
  },
  "math-median": {
    description: "Calculates the median of a list of numbers",
    parameters: z.object({
      numbers: z
        .array(z.number())
        .min(1)
        .describe("Array of numbers to find the median of"),
    }),
    async execute({ numbers }) {
      numbers.sort();

      //Find the median index
      const medianIndex = numbers.length / 2;

      let medianValue: number;
      if (numbers.length % 2 !== 0) {
        //If number is odd
        medianValue = numbers[Math.floor(medianIndex)];
      } else {
        //If number is even
        medianValue = (numbers[medianIndex] + numbers[medianIndex - 1]) / 2;
      }

      return medianValue;
    },
  },
  "math-min": {
    description: "Finds the minimum value from a list of numbers",
    parameters: z.object({
      numbers: z
        .array(z.number())
        .min(1)
        .describe("Array of numbers to find the minimum of"),
    }),
    async execute({ numbers }) {
      return Math.min(...numbers.map(Number));
    },
  },
  "math-max": {
    description: "Finds the maximum value from a list of numbers",
    parameters: z.object({
      numbers: z
        .array(z.number())
        .min(1)
        .describe("Array of numbers to find the maximum of"),
    }),
    async execute({ numbers }) {
      return Math.max(...numbers.map(Number));
    },
  },
  "math-floor": {
    description: "Rounds a number down to the nearest integer",
    parameters: z.object({
      number: z.number().describe("The number to round down"),
    }),
    async execute({ number }) {
      return Math.floor(Number(number));
    },
  },
  "math-ceiling": {
    description: "Rounds a number up to the nearest integer",
    parameters: z.object({
      number: z.number().describe("The number to round up"),
    }),
    async execute({ number }) {
      return Math.ceil(Number(number));
    },
  },
};
