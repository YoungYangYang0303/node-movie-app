// filepath: frontend/src/app/about/page.js
import styles from '@/styles/AboutPage.module.css';
import Image from 'next/image'; // 用于优化图片显示

export const metadata = {
  title: '关于我们 - 电影平台',
  description: '了解更多关于我们的电影平台、使命和团队。',
};

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>关于我们的电影平台</h1>
        <p className={styles.tagline}>连接电影爱好者与精彩视界。</p>
      </header>

      <section className={styles.section}>
        <div className={styles.imageContainer}>
          <Image
            src="/cinema-illustration.jpg" // 请确保此图片存在于 public 文件夹
            alt="电影院插画"
            width={500}
            height={350}
            className={styles.aboutImage}
            priority // 优先加载此图片
          />
        </div>
        <div className={styles.textContainer}>
          <h2>我们的使命</h2>
          <p>
            我们致力于打造一个全面、易用且充满活力的电影信息与交流平台。
            无论您是资深影迷还是偶尔观影的观众，都能在这里发现心仪的影片，
            获取详尽的电影资料，并与其他用户分享您的观影体验。
          </p>
          <p>
            我们相信电影的力量，它能够启发思考、传递情感、连接文化。
            因此，我们努力聚合最新最热的电影资源，提供客观的评分和评论，
            帮助您做出最佳的观影选择。
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.textContainer}>
          <h2>核心特色</h2>
          <ul>
            <li><strong>海量片库：</strong> 覆盖各种类型和年代的电影作品。</li>
            <li><strong>实时更新：</strong> 快速同步最新的电影上映信息和动态。</li>
            <li><strong>用户互动：</strong> 自由发表影评，参与话题讨论。</li>
            <li><strong>个性推荐：</strong> (未来功能) 基于您的喜好推荐电影。</li>
          </ul>
        </div>
        {/* 可以再加一个图片或不同的布局 */}
      </section>
      
      <section className={styles.teamSection}>
        <h2>联系我们</h2>
        <p>
          如果您对我们的平台有任何疑问、建议或合作意向，欢迎随时与我们联系。
          您的反馈是我们进步的动力！
        </p>
        <p>邮箱：<a href="mailto:contact@examplemovieplatform.com">contact@examplemovieplatform.com</a></p>
      </section>
    </div>
  );
}