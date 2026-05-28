const readline = require('readline');

const initialBalanceCents = 100000; // $1000.00
const DEFAULT_BALANCE = initialBalanceCents;

function createAccountState(balanceCents = DEFAULT_BALANCE) {
  return {
    balanceCents,
  };
}

function formatCurrency(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function parseAmountToCents(input) {
  const normalized = String(input).trim();
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  if (Number.isNaN(parsed) || parsed < 0) {
    return null;
  }

  return Math.round(parsed * 100);
}

function creditAccount(state, amountCents) {
  const nextState = createAccountState(state.balanceCents + amountCents);
  return {
    state: nextState,
    message: `Amount credited. New balance: ${formatCurrency(nextState.balanceCents)}`,
  };
}

function debitAccount(state, amountCents) {
  if (state.balanceCents >= amountCents) {
    const nextState = createAccountState(state.balanceCents - amountCents);
    return {
      state: nextState,
      message: `Amount debited. New balance: ${formatCurrency(nextState.balanceCents)}`,
    };
  }

  return {
    state: createAccountState(state.balanceCents),
    message: 'Insufficient funds for this debit.',
  };
}

function executeMenuChoice(state, choice, amountInput = null) {
  const trimmedChoice = String(choice).trim();

  switch (trimmedChoice) {
    case '1':
      return {
        state: createAccountState(state.balanceCents),
        message: `Current balance: ${formatCurrency(state.balanceCents)}`,
      };
    case '2': {
      const amountCents = parseAmountToCents(amountInput);
      if (amountCents === null) {
        return {
          state: createAccountState(state.balanceCents),
          message: 'Invalid amount. Please enter a numeric value.',
        };
      }

      return creditAccount(state, amountCents);
    }
    case '3': {
      const amountCents = parseAmountToCents(amountInput);
      if (amountCents === null) {
        return {
          state: createAccountState(state.balanceCents),
          message: 'Invalid amount. Please enter a numeric value.',
        };
      }

      return debitAccount(state, amountCents);
    }
    case '4':
      return {
        state: createAccountState(state.balanceCents),
        message: 'Exiting the program. Goodbye!',
      };
    default:
      return {
        state: createAccountState(state.balanceCents),
        message: 'Invalid choice, please select 1-4.',
      };
  }
}

function displayMenu() {
  console.log('--------------------------------');
  console.log('Account Management System');
  console.log('1. View Balance');
  console.log('2. Credit Account');
  console.log('3. Debit Account');
  console.log('4. Exit');
  console.log('--------------------------------');
}

async function promptForAmount(operation, rl) {
  const promptText = operation === 'credit' ? 'Enter credit amount: ' : 'Enter debit amount: ';
  const raw = await new Promise((resolve) => rl.question(promptText, resolve));

  const amountCents = parseAmountToCents(raw);

  if (amountCents === null) {
    console.log('Invalid amount. Please enter a numeric value.');
    return null;
  }

  return amountCents;
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let state = createAccountState();
  let running = true;

  while (running) {
    displayMenu();
    const choice = await new Promise((resolve) => rl.question('Enter your choice (1-4): ', resolve));

    let amountInput = null;
    if (choice.trim() === '2') {
      amountInput = await promptForAmount('credit', rl);
    } else if (choice.trim() === '3') {
      amountInput = await promptForAmount('debit', rl);
    }

    const result = executeMenuChoice(state, choice, amountInput);
    state = result.state;

    console.log(result.message);

    if (result.message === 'Exiting the program. Goodbye!') {
      running = false;
    }
  }

  rl.close();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  initialBalanceCents,
  DEFAULT_BALANCE,
  createAccountState,
  formatCurrency,
  parseAmountToCents,
  creditAccount,
  debitAccount,
  executeMenuChoice,
};
