import amraThumbnail from './assets/images/amra/thumbnail.svg';
import blobThumbnail from './assets/images/blob/thumbnail.jpg';
import fairdealThumbnail from './assets/images/fairdeal/thumbnail.jpg';
import taraThumbnail from './assets/images/tara/thumbnail.jpg';
import exlThumbnail from './assets/images/exl/thumbnail.jpg';
import sermobotThumbnail from './assets/images/sermobot/thumbnail.jpg';



export type Project = {
    id: string;
    firstName: string;
    lastName: string;
    tag: string;
    badges?: string[];
    thumbnail: string;
    cardSize: string;
    displayHeading?: string;
    description?: string;
    url?: string;
    github?: string;
    publish?: boolean;
    cardInverted?: string;
};

export default {
    HEADER: 'Gautham Krishna',
    TITLE: 'I create artisan digital experiences.',
    SUBTITLE: 'I also care about how it feels, not just how it works.',
    COMPANY: 'Adobe',
    COMPANY_URL: 'https://www.adobe.com',
    LOCATION: `12°58′44″N 77°35′30″E`,
    ABOUT_TAG: 'Developer | Designer',
    ABOUT_TEXT: 'As a Frontend Engineer at Adobe, I design and build scalable, high-performance web platforms. My work blends modern architecture with a strong sense of visual and interaction design. Every detail is intentional, engineered for clarity, speed, and lasting impact.',
    WORK_HEADING: 'Portfolio',

    SOCIAL_LINKS: [
        {
            text: 'LinkedIn',
            url: 'https://www.linkedin.com/in/gauthamkrishnas/',
        },
        {
            text: 'GitHub',
            url: 'https://github.com/gauthamkrishnax',
        },
        {
            text: 'Instagram',
            url: 'https://www.instagram.com/2boddah/',
        },
        {
            text: 'Behance',
            url: 'https://www.behance.net/gauthamkrishnax',
        },
    ],
    FOOTER_TEXT: '© 2026 Gautham Krishna. All rights reserved.',
}

export const projectData: Project[] = [
    {
        "id": "sermobot",
        "firstName": "Sermo",
        "lastName": "bot",
        "tag": "Design & Development",
        "badges": ["GLSL Shaders", "WebGL", "3D"],
        "thumbnail": sermobotThumbnail,
        "cardSize": "small",
        "displayHeading": "Sermobot",
        "description": "AI powered chatbot for the web",
        "url": "https://sermo.gauthamkrishna.in/",
        "github": "https://github.com/gauthamkrishnax/sermobot",
        "publish": true
    },
    {
        "id": "experience-league",
        "firstName": "Experience",
        "lastName": "League",
        "tag": "Development",
        "badges": ["AEM", "Edge Delivery Services", "CMS"],
        "thumbnail": exlThumbnail,
        "cardSize": "medium",
        "displayHeading": "Adobe Experience League",
        "description": "Adobe learning hub on Edge Delivery Services (AEM)",
        "url": "https://experienceleague.adobe.com/",
        "github": "https://github.com/adobe-experience-league/exlm",
        "publish": true
    },
    {
        "id": "blobshader",
        "firstName": "Blob",
        "lastName": "Shader",
        "badges": ["GLSL Shaders", "WebGL", "3D"],
        "description": "A 3D blob shader with a gradient background",
        "url": "https://blobshader.gauthamkrishna.in/",
        "github": "https://github.com/gauthamkrishnax/blobshader",
        "publish": true,
        "displayHeading": "Blob Shader",
        "tag": "Design & Development",
        "thumbnail": blobThumbnail,
        "cardSize": "small",
    },
    {
        "id": "amra",
        "firstName": "Amra",
        "lastName": "App",
        "tag": "Design & Development",
        "badges": ["Next.js", "Firebase", "PWA"],
        "description": "Couple finance and relationship goals app",
        "displayHeading": "Amra",
        "thumbnail": amraThumbnail,
        "cardSize": "large",
        "cardInverted": "inverted",
        "url": "https://amralove.netlify.app/",
        "github": "https://github.com/gauthamkrishnax/amra",
        "publish": true
    },
    {
        "id": "fairdeal",
        "firstName": "Fairdeal",
        "lastName": "Homes",
        "tag": "Design & Development",
        "badges": ["Next.js", "Tailwind CSS", "Lead Gen"],
        "description": "Real-estate landing page and inquiry funnel for Nikoo Garden Estate",
        "displayHeading": "Fairdeal Homes",
        "thumbnail": fairdealThumbnail,
        "cardSize": "small",
        "cardInverted": "inverted",
        "url": "https://vested-ten.vercel.app/nikoo",
        "github": "https://github.com/fairdealhomeadvisors/vested",
        "publish": true
    },
    {
        "id": "tara",
        "firstName": "Tara",
        "lastName": "App",
        "tag": "Design",
        "thumbnail": taraThumbnail,
        "cardSize": "large",
        "cardInverted": "inverted"
    }
]
