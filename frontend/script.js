// Variables
const separatorsDictionary = {
    Hyphens: '-',
    Spaces: ' ',
    Periods: '.',
    Commas: ',',
    Underscores: '_'
};

// Lexique
const file = './resources/unique_words.csv'
let frenchWords = [];

document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const rangeInput = document.getElementById('passwordLength');
    const capitalLettersCheckbox = document.getElementById('capitalLetters');
    const numbersCheckbox = document.getElementById('numbers');
    const separatorSelect = document.getElementById('inputSeparator');
    const sliderValueLabel = document.getElementById('sliderValue');
    const regenerateButton = document.getElementById('regenerateButton');
    const copyButton = document.getElementById('copyButton');

    // Output
    const passphraseDisplay = document.getElementById('passphraseDisplay');
    const scoreBar = document.getElementById('scoreBar');
    const scoreText = document.getElementById('scoreText');

    // Load words from file
    const loadWords = async () => {
        try {
            const response = await fetch(file);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.text();
            frenchWords = data.split('\r\n').filter(word => word.trim() !== '');
        } catch (error) {
            console.error('Error fetching the file:', error);
        }
    };

    // Function to populate the dropdown
    const populateSeparators = () => {
        separatorSelect.innerHTML = '';

        Object.keys(separatorsDictionary).forEach(key => {
            const option = document.createElement('option');
            option.value = key; // Use the key as the value
            option.textContent = key;
            separatorSelect.appendChild(option);
        });
    };

    // Function to update the password length display
    const updateSliderValue = (value) => {
        sliderValueLabel.textContent = `Password Length: ${value}`;
    };

    const updateScoreGraph = (percent, color) => {
        scoreBar.style.width = percent + '%';
        scoreBar.className = 'bg-' + color + '-500 h-4 rounded-full';
    }

    const updateScoreText = (time, color) => {
        let text = "?";

        // textes
        if (time > 31557600000) { // At least 1 tousand years
            text = "Thousands of years"
        }
        if (time > 3155760000) { // At least 1 century 
            text = "Centuries"
        }
        else if (time > 31557600) { // At least 1 Years
            text = "years"
        }
        else if (time > 2629800) { // At least 1 Months
            text = "Months"
        }
        else if (time > 604800) { // At least 1 Week
            text = "Weeks"
        }
        else if (time > 3600) { // At least 1 Hour
            text = "Hours"
        }
        else if (time > 60) { // At least 1 Minute
            text = "Minutes"
        }
        else { // At least 1 second
            text = "A few seconds"
        }

        scoreText.textContent = text;
        scoreText.className = 'text-' + color + '-500';
    }



    const updateScore = (passphrase) => {
        // Calculate score
        const score = new passphraseScoring(passphrase);

        let percentage = score.score;
        let time = score.calculatedCrackTime;
        let color = '';

        if (percentage < 60) {
            color = 'red';
        } else if (percentage < 90) {
            color = 'orange';
        } else {
            color = 'green';
        }

        updateScoreGraph(percentage, color);
        updateScoreText(time, color);
    }

    const generatePassphrase = () => {
        const length = parseInt(rangeInput.value);
        const useCapitalLetters = capitalLettersCheckbox.checked;
        const useNumbers = numbersCheckbox.checked;
        const separator = separatorsDictionary[separatorSelect.value];

        const generator = new Passphrase(length, useCapitalLetters, useNumbers, separator, frenchWords);

        let passphrase = generator.generatePassphrase();

        passphraseDisplay.textContent = passphrase;
        updateScore(passphrase);
    }



    // EVENT LISTENERS
    rangeInput.addEventListener('input', (event) => {
        updateSliderValue(event.target.value);
        generatePassphrase();
    });

    capitalLettersCheckbox.addEventListener('change', () => {
        generatePassphrase();
    });

    numbersCheckbox.addEventListener('change', () => {
        generatePassphrase();
    });

    separatorSelect.addEventListener('change', () => {
        generatePassphrase();
    });

    regenerateButton.addEventListener('click', () => {
        generatePassphrase();
    });

    copyButton.addEventListener('click', () => {
        const passphraseDisplay = document.getElementById('passphraseDisplay');
        const copyButton = document.getElementById('copyButton');

        navigator.clipboard.writeText(passphraseDisplay.textContent)
            .then(() => {
                const originalText = copyButton.textContent; // Save original button text
                copyButton.textContent = 'Copied!'; // Change button text

                // Reset the button text after 3 seconds
                setTimeout(() => {
                    copyButton.textContent = originalText; // Restore original text
                }, 3000);
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
            });
    });



    // Initial display update
    const main = async () => {
        await loadWords();
        populateSeparators();
        updateSliderValue(rangeInput.value);
        generatePassphrase();
    };

    main();
});


const calculateScore = (passphrase) => {
    // Returns a score from 0 to 100

    // Calculate passphrase entropy
    const entropy = calculatePasswordEntropy(passphrase);
    const maxGuesses = calculateMaxGuesses(entropy);

    const timeInSeconds = calculateCrackTime(maxGuesses);

    // Convert seconds to more readable formats
    const seconds = Math.floor(timeInSeconds);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const years = Math.floor(days / 365);

    // Format the max guesses for readability
    const formattedMaxGuesses = maxGuesses.toLocaleString();

    console.log(`Entropy: ${entropy}`);
    console.log(`Maximum Guesses: ${formattedMaxGuesses}`);
    console.log(`Time to crack: ${seconds.toLocaleString()} seconds (${minutes.toLocaleString()} minutes, ${hours.toLocaleString()} hours, ${days.toLocaleString()} days, ${years.toLocaleString()} years)`);

}






class passphraseScoring {
    constructor(passphrase) {
        this.passphrase = passphrase;
        this.guessesPerSecond = 1000000000000000000000000000n;
        this.entropy = this.calculatePasswordEntropy(this.passphrase)
        this.calculatedCrackTime = this.calculateCrackTime(this.passphrase)
        this.score = this.calculateScore()
    }

    calculatePasswordEntropy = (passphrase) => {
        // Determine the range of character types in the password
        const ranges = {
            numerics: 10,    // 0-9
            lowercase: 26,    // a-z
            uppercase: 26,    // A-Z
            special: 32       // !, @, %, $
        };

        let range = 0;

        // Check for the presence of different character types
        if (/[0-9]/.test(passphrase)) range += ranges.numerics;
        if (/[a-z]/.test(passphrase)) range += ranges.lowercase;
        if (/[A-Z]/.test(passphrase)) range += ranges.uppercase;
        // Check for special characters explicitly
        if (/[-_!@#$%^&*(),.?":{}|<> ]/.test(passphrase)) {
            range += ranges.special;
        }

        // Calculate entropy: E = L × log2(R)
        const entropy = passphrase.length * Math.log2(range);
        return Math.floor(entropy); // Floor because does not work with point
    }

    calculateCrackTime = (passphrase) => {
        // Calculate time in seconds

        const entropy = this.calculatePasswordEntropy(passphrase)
        const maxGuesses = Math.pow(2, entropy);
        
        
        console.log("entropy", entropy);
        console.log("maxGuesses", maxGuesses);
        console.log(maxGuesses);

        const timeInSeconds = Number(maxGuesses) / Number(this.guessesPerSecond);
        
        console.log("timeInSeconds", timeInSeconds/2);
        return timeInSeconds / 2; // On average it takes half the time to crack a password
    }

    // Returns a score from 0 to 100
    calculateScore = () => {



        // // Calculate passphrase entropy
        // const entropy = calculatePasswordEntropy(passphrase);
        // const maxGuesses = calculateMaxGuesses(entropy);

        // const timeInSeconds = calculateCrackTime(maxGuesses);

        // // Convert seconds to more readable formats
        // const seconds = Math.floor(timeInSeconds);
        // const minutes = Math.floor(seconds / 60);
        // const hours = Math.floor(minutes / 60);
        // const days = Math.floor(hours / 24);
        // const years = Math.floor(days / 365);

        // // Format the max guesses for readability
        // const formattedMaxGuesses = maxGuesses.toLocaleString();

        // console.log(`Entropy: ${entropy}`);
        // console.log(`Maximum Guesses: ${formattedMaxGuesses}`);
        // console.log(`Time to crack: ${seconds.toLocaleString()} seconds (${minutes.toLocaleString()} minutes, ${hours.toLocaleString()} hours, ${days.toLocaleString()} days, ${years.toLocaleString()} years)`);
        return 0;
    }
}




class Passphrase {
    constructor(length, useCapitalLetters, useNumbers, separator, dictionary) {
        this.length = length;
        this.useCapitalLetters = useCapitalLetters;
        this.useNumbers = useNumbers;
        this.separator = separator;
        this.dictionary = dictionary;
    }

    getRandomWords = (numWords) => {
        const randomWords = [];

        for (let i = 0; i < numWords; i++) {
            const randomIndex = Math.floor(Math.random() * this.dictionary.length);
            randomWords.push(frenchWords[randomIndex]);
        }

        return randomWords
    }

    capitalizeFirstLetter(words) {
        return words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    }

    addRandomNumber(words) {
        return words.map(word => {
            const randomNumber = Math.floor(Math.random() * 10); // Generate a random number between 0 and 9
            return `${word}${randomNumber}`;
        });
    }

    joinWordsWithSymbol(words, symbol) {
        return words.join(symbol);
    }

    generatePassphrase = () => {
        let passphrase = '';

        let words = this.getRandomWords(this.length);

        if (this.useCapitalLetters) {
            words = this.capitalizeFirstLetter(words);
        }

        if (this.useNumbers) {
            words = this.addRandomNumber(words);
        }

        // Add separators if needed
        if (this.separator) {
            passphrase = this.joinWordsWithSymbol(words, this.separator);
        }

        // Update the display
        return passphrase;
    };
}








// fetch('/api/hello')
//     .then(response => response.json())
//     .then(data => {
//         console.log(data.message); // Log the message from the API
//         // You can update the DOM or handle the data as needed
//     })
//     .catch(error => console.error('Error fetching the API:', error));


