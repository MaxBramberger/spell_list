import React from 'react';
import { downscaleImage } from '../util/image_util';
import { Character } from '../db/Types';
import { upsertCharacter } from '../service/CharacterService';
import ButtonRow from './buttonRow';
import Icon from '@mdi/react';
import { mdiUpload } from '@mdi/js';

interface ImageUploaderParam {
  character: Character;
}

const ImageUploader: React.FC<ImageUploaderParam> = (
  param: ImageUploaderParam
) => {
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const base64 = await downscaleImage(file);

    await upsertCharacter({ ...param.character, image: base64 });
  };

  const uploadCharacterImage = (): void => {
    const fileInput = document.getElementById(
      'imgFileInput'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click(); // Trigger file input click
    }
  };

  return (
    <>
      <ButtonRow
        icon={<Icon path={mdiUpload} size={1} />}
        label="Upload Image"
        onClick={uploadCharacterImage}
      />
      <input
        style={{ display: 'none' }}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        id="imgFileInput"
      />
    </>
  );
};

export default ImageUploader;
