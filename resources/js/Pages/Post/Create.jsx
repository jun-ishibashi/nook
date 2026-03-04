import React, {useEffect, useState} from 'react';
import ImageUpload from '@/Components/ImageUpload';
import ImageGallery from 'react-image-gallery';
import { useForm } from '@inertiajs/react';

export default function Create() {
  const { data, setData, post, reset} = useForm({
    title: '',
    user_id: 0,
    images: [],
  })
  // 投稿ステップ
  let [step, setStep] = useState(0);
  // 何枚目の画像をさしているか
  let [fileId, setFileId] = useState(0);
  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => data.images.forEach(file => URL.revokeObjectURL(file.preview));
  }, []);

  const cancel = () => {
    console.log('cancel')
    reset('title', 'user_id', 'images');
    console.log(data);
  }

  const setFiles = (files) => {
    setData('images', files);
  }

  const setTitle = (title) => {
    setData('title', title)
  }

  const nextStep = (next, additional, ...args) => {
    setStep(next);
    if(additional == null) {
      return;
    }
    additional(...args);
  }

  const submit = (e) => {
    setData('user_id', 0);
    console.log(data);
    post(route('post.store'), {
      onSuccess: () => reset('title', 'user_id', 'images'),
    });
    setStep(0);
  }

  const images = data.images.map(file => {
    return {original : file.preview, thumbnail : file.preview};
  });

  const step0 = (
    <>
      <div className='mb-6'>
        <input type="text" value={data.title} onChange={(e) => setTitle(e.target.value)} placeholder="Title here..." className="input w-full max-w-full" />
      </div>
      <ImageUpload files={data.images} setFiles={setFiles} />
      <div className='flex justify-between'>
        <a className="btn btn-outline btn-warn" href='#' onClick={() => cancel()}>cancel</a>
        <button className="btn btn-outline btn-success" onClick={() => data.images.length !== 0 && nextStep(step + 1, null)}>next</button>
      </div>
    </>
  );

  const step1 = (
    <>
      <div>
        <ImageGallery htmlFor="my-modal" items={images} onClick={(e) => console.log(fileId)} onSlide={(id) => {setFileId(id)}} />
      </div>
      <div className='flex justify-between'>
        <button className="btn btn-outline btn-warn" onClick={() => nextStep(step - 1, null)}>back</button>
        <a className="btn btn-outline btn-success" href='#' onClick={(e) => submit(e)}>
            create
        </a>
      </div>
    </>
  )

  // NOTE:文字の投稿はいったんなし。
  // const step2 = (
  //   <>
  //     <div className='p-4'>
  //       <textarea id="editor" rows="8" class="textarea block px-0 w-full text-sm text-gray-800 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400" placeholder="Write an article..." required></textarea> 
  //     </div>
  //     <div className='flex justify-between'>
  //       <button className="btn btn-outline btn-warn" onClick={() => nextStep(step - 1, null)}>back</button>
  //       <a className="btn btn-outline btn-success" href='#' onClick={() => createPost()}>create</a>
  //     </div>
  //   </>
  // )

  return (
    <>
      {
        step === 0 ? step0 : 
        step === 1 ? step1 : null
      }
    </>
  )
}