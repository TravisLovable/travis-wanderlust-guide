// Simple test script to verify the visa widget functionality
// Run with: node test-visa-widget.js

const SUPABASE_URL = "https://jmbjxlijwojvavmmzpmo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptYmp4bGlqd29qdmF2bW16cG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NzQ2NjcsImV4cCI6MjA3MDM1MDY2N30.RR7vxI8Q1kQ0Qsb20f4QK5fD4CY4zehwuq65NVgbVNo";

async function testVisaFunction(destination, userNationality = 'US', streamResponse = false) {
    console.log(`\n🧪 Testing visa requirements for ${userNationality} → ${destination} (streaming: ${streamResponse})`);
    
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/visa-requirements`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
                destination,
                userNationality,
                streamResponse
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        if (streamResponse) {
            console.log('📡 Streaming response:');
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.type === 'chunk') {
                                process.stdout.write(data.content);
                                fullContent += data.content;
                            } else if (data.type === 'complete') {
                                console.log('\n✅ Stream complete');
                                console.log(`📊 Source: ${data.dataSource || 'AI Analysis'}`);
                                return;
                            }
                        } catch (e) {
                            // Ignore parse errors
                        }
                    }
                }
            }
        } else {
            const data = await response.json();
            console.log('📄 Structured response:', JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function runTests() {
    console.log('🚀 Testing Visa Requirements Widget\n');
    
    // Test destinations that should be in database
    await testVisaFunction('France', 'US', false);
    await testVisaFunction('Japan', 'US', true);
    
    // Test destinations not in database
    await testVisaFunction('Thailand', 'US', true);
    await testVisaFunction('Morocco', 'US', true);
    
    console.log('\n✅ All tests completed!');
}

// Run tests
runTests().catch(console.error);