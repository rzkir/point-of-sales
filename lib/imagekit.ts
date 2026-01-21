import ImageKit from "imagekit";

const imagekit = {
    publicKey: process.env.IMGKIT_PUBLIC_KEY as string,
    privateKey: process.env.IMGKIT_PRIVATE_KEY as string,
    urlEndpoint: process.env.IMGKIT_URL_ENDPOINT as string,
};

const imagekitInstance = new ImageKit(imagekit);

export default imagekitInstance;