export interface ExamplePreset {
  name: string;
  description: string;
  category: "DSA Algorithms" | "JavaScript Basics";
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
    space: string;
  };
  complexityExplanation: string;
  code: string;
}

export const examples: ExamplePreset[] = [
  {
    name: "01 Bubble Sort",
    description: "In-place array sorting algorithm using nested loops",
    category: "DSA Algorithms",
    timeComplexity: {
      best: "O(n)",
      average: "O(n²)",
      worst: "O(n²)",
      space: "O(1)",
    },
    complexityExplanation:
      "Bubble Sort uses nested loops to compare adjacent items. The outer loop runs n times and the inner loop runs up to (n - i - 1) times. Total comparisons = n(n - 1) / 2 ≈ O(n²). Space complexity is O(1) because elements are swapped in-place.",
    code: `function bubbleSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
}

let numbers = [5, 3, 8, 1, 2];
bubbleSort(numbers);
console.log("Sorted array:", numbers);`,
  },
  {
    name: "02 Binary Search",
    description: "Divide & Conquer searching algorithm on sorted array",
    category: "DSA Algorithms",
    timeComplexity: {
      best: "O(1)",
      average: "O(log n)",
      worst: "O(log n)",
      space: "O(1)",
    },
    complexityExplanation:
      "Binary search cuts the search range in half in every iteration: mid = Math.floor((left + right) / 2). Starting with N elements, it takes at most log₂(N) steps to find the target. Space complexity is O(1) iterative.",
    code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) {
      return mid;
    }
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
}

let sortedArr = [2, 5, 8, 12, 16, 23, 38, 56];
let targetIndex = binarySearch(sortedArr, 23);
console.log("Target found at index:", targetIndex);`,
  },
  {
    name: "03 Two Sum",
    description: "Find pair of indices that sum to target value",
    category: "DSA Algorithms",
    timeComplexity: {
      best: "O(1)",
      average: "O(n²)",
      worst: "O(n²)",
      space: "O(1)",
    },
    complexityExplanation:
      "The brute-force two pointers approach tests all distinct pairs (i, j) where j > i. For N elements, it checks n(n - 1) / 2 pairs in the worst case, yielding O(n²) time complexity and O(1) auxiliary space.",
    code: `function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return [];
}

let nums = [2, 7, 11, 15];
let result = twoSum(nums, 9);
console.log("Pair indices:", result);`,
  },
  {
    name: "04 Move Zeroes",
    description: "Two pointers in-place array element rearrangement",
    category: "DSA Algorithms",
    timeComplexity: {
      best: "O(n)",
      average: "O(n)",
      worst: "O(n)",
      space: "O(1)",
    },
    complexityExplanation:
      "Move Zeroes uses a single pass over the array with a 'lastNonZero' pointer. Every non-zero element is swapped to the front in linear time O(n) with O(1) auxiliary memory.",
    code: `function moveZeroes(nums) {
  let lastNonZero = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      let temp = nums[lastNonZero];
      nums[lastNonZero] = nums[i];
      nums[i] = temp;
      lastNonZero++;
    }
  }
}

let arr = [0, 1, 0, 3, 12];
moveZeroes(arr);
console.log("Result:", arr);`,
  },
  {
    name: "05 Fibonacci (DP Iterative)",
    description: "Linear time dynamic programming solution for Fibonacci",
    category: "DSA Algorithms",
    timeComplexity: {
      best: "O(n)",
      average: "O(n)",
      worst: "O(n)",
      space: "O(1)",
    },
    complexityExplanation:
      "Iterative Fibonacci computes F(N) in a single loop from 2 to N, storing only the last two values (a and b). This reduces time complexity from exponential O(2ⁿ) recursion to linear O(n) time and O(1) space.",
    code: `function fibonacci(n) {
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    let c = a + b;
    a = b;
    b = c;
  }
  return b;
}

let fib7 = fibonacci(7);
console.log("7th Fibonacci number:", fib7);`,
  },
  {
    name: "06 Merge Sorted Arrays",
    description: "Two-pointer reverse merge into target array",
    category: "DSA Algorithms",
    timeComplexity: {
      best: "O(m + n)",
      average: "O(m + n)",
      worst: "O(m + n)",
      space: "O(1)",
    },
    complexityExplanation:
      "Merges two sorted arrays from the back using two pointers (p1 and p2). The loop runs at most (m + n) times, placing the largest remaining element at index i. Time complexity is O(m + n) and space is O(1).",
    code: `var merge = function (nums1, m, nums2, n) {
    let p1 = m - 1;
    let p2 = n - 1;
    for (let i = m + n - 1; i >= 0; i--) {
        if (p2 < 0) {
            break;
        }
        if (p1 >= 0 && nums1[p1] > nums2[p2]) {
            nums1[i] = nums1[p1];
            p1--;
        } else {
            nums1[i] = nums2[p2];
            p2--;
        }
    }
};

let arr1 = [1, 2, 3, 0, 0, 0];
let arr2 = [2, 5, 6];
merge(arr1, 3, arr2, 3);
console.log("Merged:", arr1);`,
  },
  {
    name: "07 Reverse String",
    description: "In-place string array reversal with Math.floor",
    category: "DSA Algorithms",
    timeComplexity: {
      best: "O(n)",
      average: "O(n)",
      worst: "O(n)",
      space: "O(1)",
    },
    complexityExplanation:
      "Iterates through half the array (Math.floor(len / 2)) and swaps the i-th element with the (len - 1 - i)-th element. Performs n/2 swaps, yielding linear O(n) time complexity and constant O(1) space.",
    code: `var reverseString = function (s) {
  let len = s.length;
  let halfLen = Math.floor(len / 2);
  for (let i = 0; i < halfLen; i++) {
    let temp = s[i];
    s[i] = s[len - 1 - i];
    s[len - 1 - i] = temp;
  }
};

let strArr = ['H', 'e', 'l', 'l', 'o'];
reverseString(strArr);
console.log("Reversed:", strArr);`,
  },
  {
    name: "08 Simple For Loop",
    description: "Basic counting loop from 0 to 4",
    category: "JavaScript Basics",
    timeComplexity: {
      best: "O(n)",
      average: "O(n)",
      worst: "O(n)",
      space: "O(1)",
    },
    complexityExplanation:
      "Simple loop iterating N times (where N = 5). Each iteration performs constant time operations O(1). Overall time complexity is O(n) and auxiliary space is O(1).",
    code: `for (let i = 0; i < 5; i++) {
  console.log("i =", i);
}`,
  },
  {
    name: "09 Nested Loops Grid",
    description: "Outer and inner loops producing 2D execution matrix",
    category: "JavaScript Basics",
    timeComplexity: {
      best: "O(N × M)",
      average: "O(N × M)",
      worst: "O(N × M)",
      space: "O(1)",
    },
    complexityExplanation:
      "The outer loop executes N times (3) and the inner loop executes M times (2) per outer iteration. Total body executions = N × M = 6 iterations, demonstrating polynomial O(N × M) or quadratic O(n²) scaling.",
    code: `for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 2; j++) {
    console.log("i:", i, "j:", j);
  }
}`,
  },
];
