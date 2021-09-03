import s1 from './assets/kanakoot/s1.png';
import s2 from './assets/kanakoot/s2.png';
import s3 from './assets/kanakoot/s3.png';
import s4 from './assets/kanakoot/s4.png';
import s5 from './assets/kanakoot/s5.png';
import s6 from './assets/kanakoot/s6.png';
import d1 from './assets/kanakoot/d1.png';
import d2 from './assets/kanakoot/d2.png';
import d3 from './assets/kanakoot/d3.png';
import d4 from './assets/kanakoot/d4.png';
import d5 from './assets/kanakoot/d5.png';
import d6 from './assets/kanakoot/d6.png';
import dev from './assets/kanakoot/dev.png';

export const projects = [
	{
		name: 'Kanakoot',
		about:
			'Kanakoot is a online calculator that calculates expense per person to balance money spent among groups.',
		ProblemStatement:
			'Find the individual share in a group expense. Who owes whom and how to tally transaction.',
		Goal: 'A website that calculates the group expense and other financial statistics.',
		role: ['Branding', 'UX design', 'Development'],
		progress: 'Completed beta phase',
		route: '/projects/kanakoot',
		link: 'https://kanakoot.netlify.app',
		behance: 'https://www.behance.net/gallery/126104247/Kanakoot-UIUX',
		github: 'https://github.com/gauthamkrishnax/Kanakoot',
		previewImage: [s1, s2, s3, s4, s5, s6],
		designImage: [d1, d2, d3, d4, d5, d6],
		design: {
			logo:
				'Logo Mark ‘K’ is formed out of keyline geometric  shapes. The tactile and physical quality of Kanakoot is reflected in the design.',
			typography:
				'Primary and only font face used is Lato. type scale includes a range of contrasting styles that support the needs of your product and its content.',
			colorPalette:
				'Color themes are designed to be harmonious, ensure accessible text, and distinguish UI elements and surfaces from one another.',
			components:
				"Components are grouped into shape categories based on their size. These categories provide a way to change multiple component values at once, by changing the category's values.",
			Elevation:
				'Shadows provide cues about depth, direction of movement, and surface edges. A surface’s shadow is determined by its elevation and relationship to other surfaces.',
			Animation:
				'Subtle animations and microinteractions for better user experiance. Motion is used to express a brand’s personality and style. Motion provides timely feedback and indicates the status of user or system actions.'
		},
		dev: {
			tools: dev,
			programmingLangauges:
				'I choose Typescript because of the complex code base and data involved in this project. The intergrated typescript experiance that Gatsby has provide a great developer experiance.  ',
			frontendFrameworks:
				'Kanakoot is static site made with Gatsby overlayed on React. Gatsby websites are fast and provide good SEO to score all high in lighthouse reports. ',
			styling:
				'Using Sass, the challenge was to write custom types for each Sass modules. Fonts were pre-fetched from google. Assets are imported directly from the filesystem using webpack. ',
			testing:
				'All the computing functions and main  front-end components are tested using the jest library to ensure better scalability.',
			other:
				'Chart.js library for the data visualisations in the calculated report. React helmet to manage document head and gatsby plugins for added functionality.',
			hosting:
				'Google analytics to measure impact and get insights and Netlify for CI/CD, deployment and scaled hosting.'
		},
		extras:
			'Kanakoot is a project that I started alone. The reason to create this project was a problem that myself encountered. My friends and I had a hard time splitting the expense between ourselve and could have really benefited from a software like Kanakoot. I choose the name Kanakoot because it means to calculate in Malayalam (my native). It took me about 2 weeks to finish of the first stages of this project and my priority was to build a modern website which was assesible and legible and in the process learn and get the experiance to work on more similar projects. '
	}
];
