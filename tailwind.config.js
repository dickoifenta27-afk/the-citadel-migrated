/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
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
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
  safelist: [
    'shadow-lg', 'shadow-[#cd7f32]/40', 'shadow-[#008080]/30', 'shadow-[#008080]/20', 'shadow-[#cd7f32]/20',
    'border-[#cd7f32]', 'border-[#cd7f32]/60', 'border-[#cd7f32]/50', 'border-[#cd7f32]/40', 'border-[#cd7f32]/30', 'border-[#cd7f32]/20',
    'text-[#ffd700]', 'text-[#e0e0e0]', 'text-[#cd7f32]', 'text-[#008080]', 'text-[#8b0000]',
    'bg-[#0a0a0c]', 'bg-[#141417]', 'bg-[#008080]', 'bg-[#005555]', 'bg-[#00a6a6]', 'bg-[#007373]', 'bg-[#ff8c42]', 'bg-[#ff7a1f]',
    'from-[#008080]', 'to-[#005555]', 'from-[#00a6a6]', 'to-[#007373]', 'from-[#ff8c42]', 'to-[#ff7a1f]',
    'hover:shadow-lg', 'hover:shadow-[#cd7f32]/40',
    'shadow-lg', 'shadow-purple-600/50',
    'hover:bg-[#ff7a1f]', 'hover:from-[#ff7a1f]',
    'bg-gradient-to-r', 'from-yellow-600', 'to-yellow-700', 'from-red-600', 'to-red-700', 'from-blue-600', 'to-blue-700', 'from-purple-600', 'to-purple-700'
  ]
}