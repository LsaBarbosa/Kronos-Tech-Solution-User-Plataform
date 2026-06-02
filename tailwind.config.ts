import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				inter: ['Inter', 'system-ui', 'sans-serif'],
			},
			colors: {
				'orange-primary': 'hsl(var(--orange-primary))',
				'orange-hover': 'hsl(var(--orange-hover))',
				'orange-light': 'hsl(var(--orange-light))',
				'blue-primary': 'hsl(var(--blue-primary))',
				'blue-hover': 'hsl(var(--blue-hover))',
				'blue-light': 'hsl(var(--blue-light))',
				'yellow-primary': 'hsl(var(--yellow-primary))',
				'yellow-hover': 'hsl(var(--yellow-hover))',
				'yellow-light': 'hsl(var(--yellow-light))',
				'red-primary': 'hsl(var(--red-primary))',
				'red-hover': 'hsl(var(--red-hover))',
				'red-light': 'hsl(var(--red-light))',
				'pink-primary': 'hsl(var(--pink-primary))',
				'pink-hover': 'hsl(var(--pink-hover))',
				'pink-light': 'hsl(var(--pink-light))',
				'green-primary': 'hsl(var(--green-primary))',
				'green-hover': 'hsl(var(--green-hover))',
				'green-light': 'hsl(var(--green-light))',
				'gray-primary': 'hsl(var(--gray-primary))',
				'gray-hover': 'hsl(var(--gray-hover))',
				'gray-light-theme': 'hsl(var(--gray-light-theme))',
				'black-primary': 'hsl(var(--black-primary))',
				'gray-light': 'hsl(var(--gray-light))',
				'gray-border': 'hsl(var(--gray-border))',
				'gray-text': 'hsl(var(--gray-text))',
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				'success-light': 'hsl(var(--success-light))',
				'destructive-light': 'hsl(var(--destructive-light))',
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			boxShadow: {
				'card': 'var(--shadow-card)',
				'input': 'var(--shadow-input)',
				'button': 'var(--shadow-button)',
			},
			transitionProperty: {
				'smooth': 'var(--transition-smooth)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'gradient-flow': {
					'0%': {
						'background-position': '0% 50%'
					},
					'50%': {
						'background-position': '100% 50%'
					},
					'100%': {
						'background-position': '0% 50%'
					}
				},
				'float-shapes': {
					'0%': {
						transform: 'translateY(0px) rotate(0deg)'
					},
					'33%': {
						transform: 'translateY(-20px) rotate(120deg)'
					},
					'66%': {
						transform: 'translateY(10px) rotate(240deg)'
					},
					'100%': {
						transform: 'translateY(0px) rotate(360deg)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'gradient-flow': 'gradient-flow 15s ease-in-out infinite',
				'float-shapes': 'float-shapes 20s ease-in-out infinite'
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
