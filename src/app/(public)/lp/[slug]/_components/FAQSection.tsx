'use client'; 
export default function FAQSection({ content }: { content: any }) {
  return (
    <div className="container mx-auto px-4 max-w-3xl">
      <h2 className="text-3xl font-black mb-8 text-center">{content.title}</h2>
      <div className="space-y-4">
        {(content.items || []).map((item: any) => (
          <div key={item.question} className="p-4 border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-bold text-card-foreground">{item.question}</h4>
            <p className="text-sm text-muted-foreground mt-2">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
