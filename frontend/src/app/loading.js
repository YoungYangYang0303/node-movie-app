export default function Loading() {
  // 你可以在这里放置任何加载动画或骨架屏
  // 例如，一个简单的文本提示：
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '80vh',
      fontSize: '1.5rem',
      color: '#555',
    }
  };
  return <div style={styles.container}><p>正在加载电影数据，请稍候...</p></div>;
}