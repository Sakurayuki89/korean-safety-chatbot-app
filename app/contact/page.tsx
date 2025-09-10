
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ContactPage.module.css';

const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message) {
      setStatus({ type: 'error', message: '문의 내용을 입력해주세요.' });
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, message }),
      });

      if (res.ok) {
        setStatus({ type: 'success', message: '문의가 성공적으로 접수되었습니다! 3초 후 메인 페이지로 이동합니다.' });
        setName('');
        setMessage('');
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        const data = await res.json();
        throw new Error(data.message || '오류가 발생했습니다.');
      }
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' });
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>문의하기</h1>
        <p className={styles.description}>궁금한 점이나 개선 요청사항을 남겨 주세요. 이름 기입은 선택입니다!</p>
        <form onSubmit={handleSubmit} className={styles.contactForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="message" className={styles.label}>문의 내용</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={styles.textarea}
              rows={6}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.label}>이름 (선택)</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.buttonGroup}>
            <button type="button" onClick={handleCancel} className={styles.cancelButton}>취소</button>
            <button type="submit" className={styles.submitButton}>제출하기</button>
          </div>
        </form>
        {status && (
          <div className={`${styles.statusMessage} ${styles[status.type]}`}>
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactPage;
