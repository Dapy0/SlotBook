import SearchPanel from '@/components/layout/SearchPanel';

const CATEGORY_WORDS = ['manicure', 'for a haircut', 'an english lesson'];

function Page() {
  return (
    <div>
      <section>
        <h1>
          Book{' '}
          <span className="sb-rotator-word">
            {CATEGORY_WORDS.map((word) => (
              <span>{word}</span>
            ))}
          </span>
        </h1>
        <p>Books without waiting and "I will recall u later".</p>
        <SearchPanel />
      </section>
    </div>
  );
}

export default Page;
