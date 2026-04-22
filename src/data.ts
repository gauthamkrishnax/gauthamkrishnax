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
        "thumbnail": "/src/assets/images/sermobot/thumbnail.jpg",
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
        "thumbnail": "/src/assets/images/exl/thumbnail.jpg",
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
        "thumbnail": "/src/assets/images/blob/thumbnail.jpg",
        "cardSize": "small",
    },
    {
        "id": "amra",
        "firstName": "Amra",
        "lastName": "App",
        "tag": "Design & Development",
        "thumbnail": "/src/assets/images/amra/thumbnail.jpg",
        "cardSize": "large",
        "cardInverted": "inverted"
    },
    {
        "id": "fairdeal",
        "firstName": "Fairdeal",
        "lastName": "Home",
        "tag": "Design & Development",
        "thumbnail": "/src/assets/images/fairdeal/thumbnail.jpg",
        "cardSize": "small",
        "cardInverted": "inverted"
    },
    {
        "id": "tara",
        "firstName": "Tara",
        "lastName": "App",
        "tag": "Design",
        "thumbnail": "/src/assets/images/tara/thumbnail.jpg",
        "cardSize": "large",
        "cardInverted": "inverted"
    }
]