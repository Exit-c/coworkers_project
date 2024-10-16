import { useState, ChangeEvent, useRef, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import EnterIcon from '@/assets/enter.svg';
import EnterActiveIcon from '@/assets/enter_active.svg';
import { useCreateTaskCommentMutation } from '@/lib/taskCommentApi';

export default function CommentWriting() {
  const router = useRouter();
  const taskId = Number(router.query.taskId);
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  const createTaskCommentMutation = useCreateTaskCommentMutation();
  const [commentValue, setCommentValue] = useState('');

  const handleResizeHeight = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= 255) {
      setCommentValue(e.target.value.trimStart());
    }

    if (commentRef.current) {
      commentRef.current.style.height = 'auto';
      commentRef.current.style.height = commentRef.current.scrollHeight + 'px';
    }
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!taskId) return;
    createTaskCommentMutation.mutate(
      {
        taskId: taskId,
        content: commentValue,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['tasks', taskId, 'comments'],
          });
          setCommentValue('');
        },
        onError: (error) => {
          console.error('댓글 작성 오류:', error);
        },
      },
    );
  };

  return (
    <form
      className="flex justify-between items-start mb-6 py-[13px] border-y border-border-primary-10"
      onSubmit={handleFormSubmit}
    >
      <label htmlFor="comment" className="hidden">
        comment
      </label>
      <textarea
        ref={commentRef}
        rows={1}
        placeholder="댓글을 달아주세요. (255자 이내)"
        value={commentValue}
        onChange={handleResizeHeight}
        className="w-full h-6 pt-[3px] text-md font-regular bg-background-secondary overflow-y-hidden outline-none resize-none placeholder:text-md placeholder:font-regular placeholder:text-text-default"
      />
      <button type="submit">
        {!commentValue ? <EnterIcon /> : <EnterActiveIcon />}
      </button>
    </form>
  );
}
