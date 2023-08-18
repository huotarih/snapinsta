# instagram-downloader
 nodejs insta downloader 


# for scrapping

    1. https://snapinsta.io/en2
    2. 
   
new changes by ana

# issue 

    Issues with these services
    Render apps sleep if they are inactive for 15 minutes.

    Or you can use something like Cron-Job.org to ping your Render service every 10 minutes to keep it awake. Render apps might take up to 30 seconds to respond after sleeping.

    Vercel is an amazing service, where you could host both your backend API and frontend application in the same repository. It focuses more on the frontend side of things.

    The downside is that Vercel uses serverless functions. It is like a great wrapper on top of AWS Lambda. It only allows personal GitHub repositories for free, not organizational ones.

    With serverless functions, the issues of cold start and losing application state comes into the picture.

    Cyclic is another awesome service where the app does not sleep if you don’t get requests for 30 minutes. It is serverless and a great wrapper on top of multiple AWS services.

    Well, that is still better than the above two options if you only have only one coding challenge to deploy.


# Host
    1. https://app.cyclic.sh
    2. https://dashboard.render.com
    3. https://vercel.com