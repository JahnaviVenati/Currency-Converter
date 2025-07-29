 class CurrencyConverter {
            constructor() {
                this.apiKey = 'YOUR_API_KEY'; // You can use exchangerate-api.com for free
                this.baseUrl = 'https://api.exchangerate-api.com/v4/latest/';
                this.fallbackUrl = 'https://api.fxratesapi.com/latest';
                this.currencies = {};
                this.exchangeRates = {};
                
                this.initializeElements();
                this.loadCurrencies();
                this.attachEventListeners();
            }

            initializeElements() {
                this.form = document.getElementById('converterForm');
                this.amountInput = document.getElementById('amount');
                this.fromSelect = document.getElementById('fromCurrency');
                this.toSelect = document.getElementById('toCurrency');
                this.swapBtn = document.getElementById('swapBtn');
                this.convertBtn = document.getElementById('convertBtn');
                this.resultSection = document.getElementById('resultSection');
                this.resultAmount = document.getElementById('resultAmount');
                this.exchangeRate = document.getElementById('exchangeRate');
                this.errorMessage = document.getElementById('errorMessage');
                this.btnText = document.querySelector('.btn-text');
                this.spinner = document.querySelector('.spinner');
            }

            async loadCurrencies() {
                try {
                    // Common currencies with their full names
                    this.currencies = {
                        'USD': '🇺🇸 USD - United States Dollar',
                        'EUR': '🇪🇺 EUR - Euro',
                        'GBP': '🇬🇧 GBP - British Pound',
                        'JPY': '🇯🇵 JPY - Japanese Yen',
                        'AUD': '🇦🇺 AUD - Australian Dollar',
                        'CAD': '🇨🇦 CAD - Canadian Dollar',
                        'CHF': '🇨🇭 CHF - Swiss Franc',
                        'CNY': '🇨🇳 CNY - Chinese Yuan',
                        'INR': '🇮🇳 INR - Indian Rupee',
                        'KRW': '🇰🇷 KRW - South Korean Won',
                        'MXN': '🇲🇽 MXN - Mexican Peso',
                        'SGD': '🇸🇬 SGD - Singapore Dollar',
                        'NZD': '🇳🇿 NZD - New Zealand Dollar',
                        'NOK': '🇳🇴 NOK - Norwegian Krone',
                        'SEK': '🇸🇪 SEK - Swedish Krona',
                        'PLN': '🇵🇱 PLN - Polish Zloty',
                        'TRY': '🇹🇷 TRY - Turkish Lira',
                        'RUB': '🇷🇺 RUB - Russian Ruble',
                        'BRL': '🇧🇷 BRL - Brazilian Real',
                        'ZAR': '🇿🇦 ZAR - South African Rand'
                    };

                    this.populateDropdowns();
                    
                    // Set default values to match the screenshot
                    this.fromSelect.value = 'INR';
                    this.toSelect.value = 'USD';
                    
                } catch (error) {
                    this.showError('Failed to load currencies. Please refresh the page.');
                }
            }

            populateDropdowns() {
                // Clear existing options except the first one
                this.fromSelect.innerHTML = '<option value="">Select Currency</option>';
                this.toSelect.innerHTML = '<option value="">Select Currency</option>';

                // Add currency options
                Object.entries(this.currencies).forEach(([code, name]) => {
                    const option1 = new Option(name, code);
                    const option2 = new Option(name, code);
                    this.fromSelect.appendChild(option1);
                    this.toSelect.appendChild(option2);
                });
            }

            attachEventListeners() {
                this.form.addEventListener('submit', this.handleSubmit.bind(this));
                this.swapBtn.addEventListener('click', this.swapCurrencies.bind(this));
            }

            swapCurrencies() {
                const fromValue = this.fromSelect.value;
                const toValue = this.toSelect.value;
                
                this.fromSelect.value = toValue;
                this.toSelect.value = fromValue;
                
                // Auto-convert if both currencies are selected
                if (fromValue && toValue) {
                    this.convertCurrency();
                }
            }

            async handleSubmit(e) {
                e.preventDefault();
                await this.convertCurrency();
            }

            async convertCurrency() {
                const amount = parseFloat(this.amountInput.value);
                const fromCurrency = this.fromSelect.value;
                const toCurrency = this.toSelect.value;

                if (!amount || !fromCurrency || !toCurrency) {
                    this.showError('Please fill in all fields.');
                    return;
                }

                if (amount <= 0) {
                    this.showError('Please enter a valid amount greater than 0.');
                    return;
                }

                this.showLoading(true);
                this.hideError();

                try {
                    const rate = await this.getExchangeRate(fromCurrency, toCurrency);
                    const convertedAmount = amount * rate;
                    
                    this.displayResult(convertedAmount, toCurrency, rate, fromCurrency);
                } catch (error) {
                    this.showError('Failed to fetch exchange rates. Please try again.');
                    console.error('Conversion error:', error);
                } finally {
                    this.showLoading(false);
                }
            }

            async getExchangeRate(from, to) {
                try {
                    // First try the primary API
                    const response = await fetch(`${this.baseUrl}${from}`);
                    
                    if (!response.ok) {
                        throw new Error('Primary API failed');
                    }
                    
                    const data = await response.json();
                    
                    if (data.rates && data.rates[to]) {
                        return data.rates[to];
                    } else {
                        throw new Error('Rate not found');
                    }
                } catch (error) {
                    // Fallback to alternative API
                    try {
                        const fallbackResponse = await fetch(`${this.fallbackUrl}?base=${from}&symbols=${to}`);
                        const fallbackData = await fallbackResponse.json();
                        
                        if (fallbackData.rates && fallbackData.rates[to]) {
                            return fallbackData.rates[to];
                        }
                    } catch (fallbackError) {
                        console.error('Fallback API also failed:', fallbackError);
                    }
                    
                    // If both APIs fail, throw error
                    throw new Error('All APIs failed');
                }
            }

            displayResult(amount, currency, rate, fromCurrency) {
                this.resultAmount.textContent = `${amount.toFixed(2)} ${currency}`;
                this.exchangeRate.textContent = `1 ${fromCurrency} = ${rate.toFixed(4)} ${currency}`;
                this.resultSection.style.display = 'block';
                this.resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            showLoading(show) {
                if (show) {
                    this.convertBtn.disabled = true;
                    this.btnText.textContent = 'Converting...';
                    this.spinner.style.display = 'inline-block';
                } else {
                    this.convertBtn.disabled = false;
                    this.btnText.textContent = 'Convert';
                    this.spinner.style.display = 'none';
                }
            }

            showError(message) {
                this.errorMessage.textContent = message;
                this.errorMessage.style.display = 'block';
                this.resultSection.style.display = 'none';
            }

            hideError() {
                this.errorMessage.style.display = 'none';
            }
        }

        // Initialize the converter when the page loads
        document.addEventListener('DOMContentLoaded', () => {
            new CurrencyConverter();
        });