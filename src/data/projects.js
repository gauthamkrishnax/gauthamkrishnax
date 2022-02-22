const projects = [
	{
		no: 1,
		Name: 'Lofidom',
		img: '/images/lofidom.jpg',
		desc: 'A Simple Website for Non Stop Lofi Music with a rich and immersive frontend. I used the <strong>Youtube Embedded API</strong> to fetch videos and streams from Youtube an animated model from <strong>Mixamo</strong>, optimised it highly in <strong>Blender</strong>.Then Converted the model into <strong>GLTF</strong> and compressed using Draco and using <strong>Three.js</strong> I made the dom scene with the particle system to mimic stars.',
		site: 'https://lofidom.netlify.app/',
		repo: 'https://github.com/gauthamkrishnax/LofiDom'
	},
	{
		no: 2,
		Name: 'Kanakoot',
		img: '/images/kanakoot.jpg',
		desc: 'A <strong>serverless web app</strong> to share your group expenses easily and find the financial statistics involved. I choose <strong>Typescript</strong> with <strong>Gatsby.js</strong> to build a static site. <strong>Sass</strong> for styling and <strong>Jest</strong> for testing the app. <strong>Chart.js</strong> for data visualisations in the calculated report. Used <strong>Google ananytics</strong> for measurements and <strong>Netlify</strong> to host the website.',
		site: 'https://kanakoot.netlify.app/',
		repo: 'https://github.com/gauthamkrishnax/Kanakoot'
	},
	{
		no: 3,
		Name: 'Pecker Note',
		img: '/images/peckernote.jpg',
		desc: 'A minimal note making app with a beautiful user interface designed in <strong>Figma</strong>. Used <strong>Next.js</strong> with <strong>Sass</strong>, <strong>Post CSS</strong>, <strong>Framer motion</strong> and <strong>X-masonry</strong> for creating the frontend. <strong>Node.js</strong> with <strong>Express.js</strong> for the server and <strong>Passport.js</strong> for authentication. <strong>Mongodb Atlas</strong> for database and interfaced <strong>Moongoose</strong> as ODM. API server and frontend web app distributed using <strong>Docker</strong> in separate containers and hosted on <strong>Heroku</strong>.',
		site: 'https://peckernote-web.herokuapp.com/',
		repo: 'https://github.com/gauthamkrishnax/peckernote'
	}
];

export default projects;
