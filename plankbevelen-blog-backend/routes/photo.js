import express from 'express';
import photoService from '../services/photoService.js';

const photoRouter = express.Router();

photoRouter.post('/list', async (req, res) => {
    const { album_id, page, page_size } = req.body;
    try {
        const photoRes = await photoService.getPhotosByAlbum(album_id, page, page_size);
        res.status(200).json(photoRes);
    } catch (error) {
        console.log(error);

        res.status(500).json({ error: 'Internal server error' });
    }
});

photoRouter.post('/upload', async (req, res) => {
    const { album_id, photos } = req.body;
    try {
        console.log(album_id, photos.length)
        const PhotoRes = await photoService.uploadPhotos({
            album_id,
            photos,
        });
        console.log(PhotoRes);
        res.status(200).json(PhotoRes);
    } catch (error) {
        console.log(error);

        res.status(500).json({ error: 'Internal server error' });
    }
})



export default photoRouter;
